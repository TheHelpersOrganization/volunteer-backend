import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateContactInputDto } from 'src/contact/dtos';
import { IsFileId } from 'src/file/validators';

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

  @IsOptional()
  @Type(() => CreateContactInputDto)
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  contacts?: CreateContactInputDto[];
}
