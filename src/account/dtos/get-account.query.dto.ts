import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';

export class GetAccountQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];
}
