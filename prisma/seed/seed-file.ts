import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { File, Prisma, PrismaClient } from '@prisma/client';
import { Axios } from 'axios';
import * as mimeTypes from 'mime-types';
import { nanoid } from 'nanoid';
import * as fs from 'node:fs';
import * as path from 'path';
import { normalizeFileSize, throwIfNullish } from './utils';

type FileOutput = { path: string; name: string; mimetype?: string };

const s3Client = new S3({
  endpoint: process.env.FILE_ENDPOINT,
  region: process.env.FILE_REGION,
  credentials: {
    accessKeyId: throwIfNullish(process.env.FILE_ACCESS_KEY),
    secretAccessKey: throwIfNullish(process.env.FILE_SECRET_KEY),
  },
});
const bucket = throwIfNullish(process.env.FILE_BUCKET);

const axios = new Axios({
  headers: {
    'Access-Control-Expose-Headers': '*',
  },
});

export const resetBucket = async () => {
  try {
    const objects = await s3Client.listObjectsV2({ Bucket: bucket });
    if (objects.Contents) {
      await s3Client.deleteObjects({
        Bucket: bucket,
        Delete: {
          Objects: objects.Contents.map((obj) => ({ Key: obj.Key })),
        },
      });
    }
  } catch (err) {
    console.error('Failed to reset bucket');
    console.log(err);
    return;
  }

  try {
    await s3Client.deleteBucket({
      Bucket: bucket,
    });
  } catch (err) {
    console.error('Failed to delete bucket');
    console.log(err);
  }

  try {
    await s3Client.createBucket({
      Bucket: bucket,
    });
  } catch (err) {
    console.error('Failed to create bucket');
    console.log(err);
  }
};

export const seedFiles = async (
  prisma: PrismaClient,
  relativeOutputFolderPath: string,
  count: number,
  generateUrl: () => string,
) => {
  const files: (File | null)[] = [];
  const folderPath = path.join(__dirname, relativeOutputFolderPath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const existingFiles = fs.readdirSync(folderPath);

  const downloads: Promise<FileOutput>[] = [];
  for (let i = 0; i < count - existingFiles.length; i++) {
    downloads.push(downloadFileAndSave(generateUrl(), folderPath));
  }
  for (let i = 0; i < existingFiles.length; i++) {
    const file = existingFiles[i];
    const filePath = path.join(folderPath, file);
    downloads.push(getFile(filePath));
  }
  const downloadedFiles: (FileOutput | null)[] = [];
  for (let i = 0; i < downloads.length; i++) {
    const download = downloads[i];
    try {
      const downloadedFile = await download;
      downloadedFiles.push(downloadedFile);
    } catch (err) {
      downloadedFiles.push(null);
    }
  }

  const uploads: Promise<File | null>[] = [];
  downloadedFiles.forEach((file) => {
    if (file == null) {
      uploads.push(Promise.resolve(null));
      return;
    }
    const fileStat = fs.statSync(file.path);
    const buffer = fs.readFileSync(file.path);
    const upload = uploadFileToStorage(
      prisma,
      buffer,
      file.name,
      fileStat,
      file.mimetype,
    );
    uploads.push(upload);
  });
  const uploadedFiles: (File | null)[] = [];
  for (let i = 0; i < uploads.length; i++) {
    const upload = uploads[i];
    try {
      const uploadedFile = await upload;
      uploadedFiles.push(uploadedFile);
    } catch (err) {
      uploadedFiles.push(null);
    }
  }

  files.push(...uploadedFiles);

  return files;
};

const uploadFileToStorage = async (
  prisma: PrismaClient,
  buffer: Buffer,
  originalname: string,
  fileStat: fs.Stats,
  mimetype?: string,
) => {
  const key = nanoid();
  const metadata = {
    originalname,
  };
  if (mimetype) {
    metadata['mimetype'] = mimetype;
  }
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Body: buffer,
      Key: key,
      Metadata: metadata,
    },
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false, // optional manually handle dropped parts
  });
  upload.done();

  const normalizedFileSize = normalizeFileSize(fileStat.size);
  const file: Prisma.FileUncheckedCreateInput = {
    name: originalname,
    internalName: key,
    mimetype: mimetype,
    path: '/',
    size: normalizedFileSize.size,
    sizeUnit: normalizedFileSize.unit,
    createdBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await prisma.file.create({ data: file });
  return res;
};

const downloadFileAndSave = async (
  url: string,
  outputFolderPath: string,
  fileName?: string,
) => {
  return axios.get(url, { responseType: 'stream' }).then((response) => {
    return new Promise<FileOutput>((resolve, reject) => {
      let filename: string;
      let mimetype: string | undefined;
      if (fileName) {
        filename = fileName;
        mimetype = mimeTypes.lookup(fileName) || undefined;
      } else {
        mimetype = (
          response.headers['content-type'] || response.headers['Content-Type']
        )
          ?.split(';')
          .shift();
        const ext =
          (mimetype == null ? undefined : mimeTypes.extension(mimetype)) ?? '';
        const contentDisposition: string | undefined =
          response.headers['content-disposition'] ||
          response.headers['Content-Disposition'];
        if (
          contentDisposition == null ||
          contentDisposition === 'inline' ||
          contentDisposition === 'attachment'
        ) {
          filename = `${nanoid()}.${ext}`;
        } else {
          filename = contentDisposition.split('filename=')[1];
        }
      }

      const filepath = path.join(outputFolderPath, filename);
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error: Error | null = null;

      writer.on('error', (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve({
            path: filepath,
            name: filename,
            mimetype: mimetype,
          });
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
};

const getFile = async (filepath: string): Promise<FileOutput> => {
  const filename = path.basename(filepath);
  return {
    path: filepath,
    name: filename,
    mimetype: mimeTypes.lookup(filepath) || undefined,
  };
};
