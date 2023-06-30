import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NotificationType } from '../constants';

export class CreateNotificationInputDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  shortDescription?: string;

  @IsOptional()
  @IsInt()
  activityId?: number;

  @IsOptional()
  @IsInt()
  shiftId?: number;

  @IsOptional()
  @IsInt()
  organizationId?: number;

  @IsOptional()
  @IsInt()
  reportId?: number;
}

export class TestCreateNotificationInputDto {
  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  shortDescription?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  registrationTokens?: string[];

  @IsOptional()
  @IsString()
  topic?: string;
}
