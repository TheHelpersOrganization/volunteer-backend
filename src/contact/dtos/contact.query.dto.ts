import { PaginationQueryDto } from '@app/common/dtos';
import {
  stringToIntArrayTransform,
  stringToIntTransform,
} from '@app/common/transformers';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ContactQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  id?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  excludeId?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsInt({ each: true })
  @Transform(stringToIntTransform)
  accountId?: number;

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  organizationId?: number;
}
