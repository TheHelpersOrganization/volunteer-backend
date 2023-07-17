import {
  IsArray,
  IsBoolean,
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
  @IsBoolean()
  pushOnly?: boolean;

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

  @IsOptional()
  @IsInt()
  chatId?: number;
}

export class CreateNotificationsInputDto extends CreateNotificationInputDto {
  @IsOptional()
  @IsInt({ each: true })
  @IsArray()
  accountIds: number[];
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
