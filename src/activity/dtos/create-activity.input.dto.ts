import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsFileId } from 'src/file/validators';
import { CreateLocationInputDto } from 'src/location/dtos';

export class CreateActivityInputDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

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

  @Type(() => CreateLocationInputDto)
  @ValidateNested({ each: true })
  location: CreateLocationInputDto;
}
