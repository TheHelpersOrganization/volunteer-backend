import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsISO31661Alpha2,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';

export class ActivityQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  n?: string;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  @Transform(({ value }) => value.split(',').map(Number))
  org?: number[];

  // Start date
  @IsOptional()
  @IsDate()
  sd?: Date;

  // End date
  @IsOptional()
  @IsDate()
  ed?: Date;

  // Number of participants
  @IsOptional()
  @IsNumber()
  nofp?: number;

  // Skills
  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  sk?: number[];

  // Locality
  @IsOptional()
  @IsString()
  lc?: string;

  // Region
  @IsOptional()
  @IsString()
  rg?: string;

  // Country
  @IsOptional()
  @IsISO31661Alpha2()
  ct?: string;

  @IsOptional()
  @IsLatitude()
  lat: number;

  @IsOptional()
  @IsLongitude()
  lng: number;
}
