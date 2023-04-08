import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';
import { stringToBoolean } from 'src/common/transformers';

export class GetAccountQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];

  @IsOptional()
  @Transform(stringToBoolean)
  @IsBoolean()
  isBanned?: boolean;
}
