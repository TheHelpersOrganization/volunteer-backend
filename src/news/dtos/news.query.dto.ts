import { PaginationQueryDto } from '@app/common/dtos';
import {
  stringToBooleanTransform,
  stringToIntArrayTransform,
  stringToIntTransform,
  stringToStringArrayTransform,
} from '@app/common/transformers';
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

export enum NewsInclude {
  Author = 'author',
}

export const newsIncludes = Object.values(NewsInclude);

export enum NewsSort {
  RelevanceAsc = 'relevance',
  RelevanceDesc = '-relevance',
  DateAsc = 'date',
  DateDesc = '-date',
  ViewsAsc = 'views',
  ViewsDesc = '-views',
}

export class NewsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(NewsInclude, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(newsIncludes.length)
  @Transform(stringToStringArrayTransform)
  include?: NewsInclude[];
}

export class ManyNewsQueryDto extends NewsQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  id: number[];

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  organizationId?: number;

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  authorId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsEnum(NewsSort)
  sort?: NewsSort;
}
