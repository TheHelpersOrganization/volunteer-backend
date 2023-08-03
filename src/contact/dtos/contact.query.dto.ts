import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import {
  stringToIntArrayTransform,
  stringToIntTransform,
} from 'src/common/transformers';

export class ContactQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  id?: number[];

  @IsOptional()
  @IsInt({ each: true })
  @Transform(stringToIntTransform)
  accountId?: number;

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  organizationId?: number;
}
