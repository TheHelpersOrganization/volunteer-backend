import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dtos';

export class SkillQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;
}
