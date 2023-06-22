import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';

export class BaseGetNotificationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  @IsInt({ each: true })
  @Transform(({ value }) => value.map((v) => parseInt(v)))
  id?: number[];
}

export class GetNotificationsQueryDto extends BaseGetNotificationsQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  @IsInt({ each: true })
  @Transform(({ value }) => value.map((v) => parseInt(v)))
  accountId?: number[];
}
