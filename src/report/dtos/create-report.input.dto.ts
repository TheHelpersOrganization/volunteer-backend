import { IsFileId } from '@app/file/validators';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ReportType } from '../constants';

export class CreateReportMessageInputDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(16)
  @IsFileId({ each: true })
  fileIds?: number[];
}

export class CreateReportInputDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsString()
  @MaxLength(256)
  title: string;

  @Type(() => CreateReportMessageInputDto)
  @ValidateNested()
  message: CreateReportMessageInputDto;

  @IsOptional()
  @IsInt()
  reportedAccountId?: number;

  @IsOptional()
  @IsInt()
  reportedOrganizationId?: number;

  @IsOptional()
  @IsInt()
  reportedActivityId?: number;

  @IsOptional()
  @IsInt()
  reportedNewsId?: number;
}
