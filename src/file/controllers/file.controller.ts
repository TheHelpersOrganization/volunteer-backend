import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { PaginationParamsDto } from 'src/common/dtos';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { UploadFileOutputDto } from '../dtos/upload-file-output.dto';
import { FileService } from '../services';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getFiles(
    @ReqContext() context: RequestContext,
    @Query() query: PaginationParamsDto,
  ) {
    return this.fileService.listFiles(context, query.limit, query.offset);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @ReqContext() context: RequestContext,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileOutputDto> {
    return this.fileService.uploadFile(
      context,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Get('download/:id')
  async downloadFileById(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<StreamableFile> {
    const fileInfo = await this.fileService.downloadFileById(ctx, id);
    return new StreamableFile(fileInfo.stream, {
      type: fileInfo.file.mimetype,
      disposition: `attachment; filename="${fileInfo.file.name}"`,
    });
  }
}
