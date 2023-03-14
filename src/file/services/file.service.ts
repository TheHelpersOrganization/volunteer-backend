import { BucketAlreadyExists, NoSuchKey, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { nanoid } from 'nanoid';
import fileConfig from 'src/common/configs/subconfigs/file.config';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { Readable } from 'stream';

import { FileOutputDto } from '../dtos/file-output.dto';
import { UploadFileOutputDto } from '../dtos/upload-file-output.dto';
import { File } from '../entities';
import { FileProcessingHasNotFinished } from '../exceptions';
import { FileNotFoundException } from '../exceptions/file-not-found.exception';
import { FileRepository } from '../repositories';

@Injectable()
export class FileService extends AbstractService {
  private readonly client: S3;
  private readonly bucket: string;

  constructor(
    @Inject(fileConfig.KEY) fileConfigApi: ConfigType<typeof fileConfig>,
    private readonly fileRepository: FileRepository,
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
    const files = await this.fileRepository.find({
      where: {
        createdBy: ctx.account.id,
      },
      take: limit,
      skip: offset,
    });
    return this.outputArray(FileOutputDto, files);
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

    this.uploadFileToS3(ctx, upload);

    const file: Partial<File> = {
      name: originalname,
      internalName: key,
      mimetype: mimetype,
      path: '/',
      createdBy: ctx.account.id,
    };

    const res = await this.fileRepository.save(file);
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
  ): Promise<{ stream: Readable; file: FileOutputDto }> {
    this.logCaller(ctx, this.downloadFileById);

    const file = await this.fileRepository.findOneBy({ id: id });
    if (!file) {
      throw new FileNotFoundException();
    }

    try {
      const stream = await this.downloadFileFromS3(file);
      return {
        stream: stream,
        file: file,
      };
    } catch (err) {
      if (err instanceof NoSuchKey) {
        throw new FileProcessingHasNotFinished();
      }
      throw err;
    }
  }

  async downloadFileFromS3(file: File): Promise<Readable> {
    const res = await this.client.getObject({
      Bucket: this.bucket,
      Key: file.internalName,
    });
    return res.Body as Readable;
  }
}
