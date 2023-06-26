import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { stringToBooleanTransform } from 'src/common/transformers';
import {
  ReportStatus,
  ReportType,
  reportStatuses,
  reportTypes,
} from '../constants';

export enum GetReportQuerySort {
  createdAtAsc = 'createdAt',
  createdAtDesc = '-createdAt',
  updatedAtAsc = 'updatedAt',
  updatedAtDesc = '-updatedAt',
}

export const getReportQuerySorts = Object.values(GetReportQuerySort);

export class GetReportQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  @Transform(({ value }) => value.split(',').map(parseInt))
  id?: number[];

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  reporterId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  mine?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ReportType, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(reportTypes.length)
  @Transform(({ value }) => value.split(','))
  type?: ReportType[];

  @IsOptional()
  @IsArray()
  @IsEnum(ReportStatus, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(reportStatuses.length)
  @Transform(({ value }) => value.split(','))
  status?: ReportStatus[];

  @IsOptional()
  @IsEnum(GetReportQuerySort)
  sort?: GetReportQuerySort;
}
