import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';
import { stringToBoolean } from 'src/common/transformers';
import { EMAIL_MAX_LENGTH } from '../constants';

export enum GetAccountIncludes {
  VerificationList = 'verification-list',
  BanList = 'ban-list',
}

export class BaseAccountQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetAccountIncludes, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  includes?: GetAccountIncludes[];
}

export class GetAccountQueryDto extends BaseAccountQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];

  @IsOptional()
  @Transform(stringToBoolean)
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @Transform(stringToBoolean)
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  createdAt?: Date[];
}
