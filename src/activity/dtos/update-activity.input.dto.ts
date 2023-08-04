import { IsFileId } from '@app/file/validators';
import { CreateLocationInputDto } from '@app/location/dtos';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateActivityInputDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  skillIds?: number[];

  @IsOptional()
  @IsFileId()
  thumbnail?: number;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  activityManagerIds?: number[];

  // @IsOptional()
  // @Type(() => CreateContactInputDto)
  // @ValidateNested({ each: true })
  // @ArrayNotEmpty()
  // contacts?: CreateContactInputDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  contacts: number[];

  @IsOptional()
  @Type(() => CreateLocationInputDto)
  @ValidateNested({ each: true })
  location: CreateLocationInputDto;
}
