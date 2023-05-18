import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsISO31661Alpha2,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';
import { separatedCommaNumberArrayTransform } from 'src/common/transformers';

export class GetActivityByIdQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  n?: string;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Transform(({ value }) => value.split(',').map(Number))
  org?: number[];

  // Start date
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  st?: Date[];

  // End date
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  et?: Date[];

  // Number of participants
  @IsOptional()
  @IsNumber()
  nofp?: number;

  // Available slots
  @IsOptional()
  @IsNumberString()
  av?: number;

  // Activity types
  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Transform(separatedCommaNumberArrayTransform)
  as?: number[];

  // Skills
  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Transform(separatedCommaNumberArrayTransform)
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

  @IsOptional()
  @IsNumberString()
  @Min(0)
  rd: number;
}

export class GetActivitiesQueryDto extends GetActivityByIdQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber(undefined, { each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];
}
