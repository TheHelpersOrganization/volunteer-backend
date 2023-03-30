import { BucketAlreadyExists, NoSuchKey, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { File } from '@prisma/client';
import { nanoid } from 'nanoid';
import fileConfig from 'src/common/configs/subconfigs/file.config';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { Readable } from 'stream';

import { PrismaService } from '../../prisma';
import { DownloadFileQueryDto } from '../dtos/download-file.query.dto';
import { FileOutputDto } from '../dtos/file-output.dto';
import { UploadFileOutputDto } from '../dtos/upload-file-output.dto';
import { FileProcessingHasNotFinished } from '../exceptions';
import { FileNotFoundException } from '../exceptions/file-not-found.exception';

@Injectable()
export class FileService extends AbstractService {
  private readonly client: S3;
  private readonly bucket: string;

  constructor(
    @Inject(fileConfig.KEY) fileConfigApi: ConfigType<typeof fileConfig>,
    private readonly prisma: PrismaService,
    logger: AppLogger,
  ) {
    super(logger);
    this.client = new S3({
      endpoint: fileConfigApi.endpoint,
      region: fileConfigApi.region,
      credentials: {
        accessKeyId: fileConfigApi.accessKey,
        secretAccessKey: fileConfigApi.secretKey,
      },
    });
    this.bucket = fileConfigApi.bucket;
    this.setup();
  }

  async setup() {
    try {
      await this.client.createBucket({
        Bucket: this.bucket,
      });
    } catch (err) {
      if (!(err instanceof BucketAlreadyExists)) {
        throw err;
      }
    }
  }

  async listFiles(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<FileOutputDto[]> {
    this.logCaller(ctx, this.listFiles);
    const files = await this.prisma.file.findMany({
      where: {
        createdBy: ctx.account.id,
      },
      take: limit,
      skip: offset,
    });
    return this.outputArray(FileOutputDto, files);
  }

  async getById(id: number) {
    return this.prisma.file.findUnique({ where: { id: id } });
  }

  async getByIds(ids: number[]) {
    return this.prisma.file.findMany({ where: { id: { in: ids } } });
  }

  async uploadFile(
    ctx: RequestContext,
    buffer: Buffer,
    originalname: string,
    mimetype: string,
  ): Promise<UploadFileOutputDto> {
    this.logCaller(ctx, this.uploadFile);

    const key = nanoid();
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Body: buffer,
        Key: key,
        Metadata: {
          originalname: originalname,
          mimetype: mimetype,
        },
      },
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    });

    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded != null && progress.total != null) {
        this.logger.log(
          ctx,
          `file upload progress: ${Math.round(
            (progress.loaded / progress.total) * 100,
          )}%`,
        );
      }
    });

    await this.uploadFileToS3(ctx, upload);

    const file = {
      name: originalname,
      internalName: key,
      mimetype: mimetype,
      path: '/',
      createdBy: ctx.account.id,
    };

    const res = await this.prisma.file.create({ data: file });
    return this.output(UploadFileOutputDto, res);
  }

  private async uploadFileToS3(ctx: RequestContext, upload: Upload) {
    this.logger.log(ctx, 'start uploading file');
    const startTime = Date.now();
    await upload.done();
    this.logger.log(
      ctx,
      `upload file completed, took ${Date.now() - startTime} ms`,
    );
  }

  async downloadFileById(
    ctx: RequestContext,
    id: number,
    query?: DownloadFileQueryDto,
  ): Promise<{ stream: Readable; file: FileOutputDto }> {
    this.logCaller(ctx, this.downloadFileById);
    const file = await this.prisma.file.findUnique({ where: { id: id } });
    return this.downloadFile(file, query);
  }

  async downloadFileByInternalName(
    context: RequestContext,
    name: string,
    query?: DownloadFileQueryDto,
  ): Promise<{ stream: Readable; file: FileOutputDto }> {
    this.logCaller(context, this.downloadFileByInternalName);
    const file = await this.prisma.file.findUnique({
      where: { internalName: name },
    });
    return this.downloadFile(file, query);
  }

  private async downloadFile(
    file: File | null,
    query?: DownloadFileQueryDto,
  ): Promise<{ stream: Readable; file: FileOutputDto }> {
    const safeFile = await this.validateDownloadFile(file, query);
    try {
      const stream = await this.downloadFileFromS3(safeFile);
      return {
        stream: stream,
        file: safeFile,
      };
    } catch (err) {
      if (err instanceof NoSuchKey) {
        throw new FileProcessingHasNotFinished();
      }
      throw err;
    }
  }

  private validateDownloadFile(
    file: File | null,
    query?: DownloadFileQueryDto,
  ): File {
    if (!file) {
      throw new FileNotFoundException();
    }

    if (query) {
      const type = query.type;
      const subtype = query.subtype;

      if (type != null) {
        if (!file.mimetype.startsWith(type)) {
          throw new FileNotFoundException();
        }
        if (subtype != null && file.mimetype !== `${type}/${subtype}`) {
          throw new FileNotFoundException();
        }
      }
    }

    return file;
  }

  private async downloadFileFromS3(file: File): Promise<Readable> {
    const res = await this.client.getObject({
      Bucket: this.bucket,
      Key: file.internalName,
    });
    return res.Body as Readable;
  }
}
