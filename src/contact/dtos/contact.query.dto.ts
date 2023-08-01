import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import {
  stringToIntArrayTransform,
  stringToIntTransform,
} from 'src/common/transformers';

export class ContactQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  id?: number[];

  @IsOptional()
  @IsArray()
  @IsInt()
  @Transform(stringToIntTransform)
  organizationId?: number;
}
