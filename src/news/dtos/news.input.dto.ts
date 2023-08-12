import { ContextAwareDto as RequestContextAwareDto } from '@app/common/dtos';
import { ClientIsMemberOfOrganization } from '@app/organization/validators';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  NEWS_MAX_CONTENT_LENGTH,
  NEWS_MAX_TITLE_LENGTH,
  NewsContentFormat,
} from '../constants';

export class CreateNewsInputDto extends RequestContextAwareDto {
  @IsInt()
  @ClientIsMemberOfOrganization()
  organizationId: number;

  @IsString()
  @MaxLength(NEWS_MAX_TITLE_LENGTH)
  title: string;

  @IsString()
  @MaxLength(NEWS_MAX_CONTENT_LENGTH)
  content: string;

  @IsEnum(NewsContentFormat)
  contentFormat: NewsContentFormat;

  @IsOptional()
  @IsInt()
  thumbnail?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateNewsInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(NEWS_MAX_TITLE_LENGTH)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(NEWS_MAX_CONTENT_LENGTH)
  content: string;

  @IsOptional()
  @IsInt()
  thumbnail?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
