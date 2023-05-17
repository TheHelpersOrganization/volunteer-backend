import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from '../../common/dtos';

export class SkillQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];
}
