import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateContactInputDto } from 'src/contact/dtos';
import { CreateLocationInputDto } from 'src/location/dtos';
import { CreateShiftManagerInputDto } from '.';

import { CreateShiftSkillInputDto } from 'src/shift-skill/dtos';
import {
  SHIFT_DESCRIPTION_MAX_LENGTH,
  SHIFT_NAME_MAX_LENGTH,
} from '../constants';

export class UpdateShiftInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(SHIFT_NAME_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(SHIFT_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  @ValidateIf((target, value) => value >= target.startTime)
  endTime?: Date;

  @IsOptional()
  @IsNumber()
  numberOfParticipants?: number;

  @IsOptional()
  @Type(() => CreateLocationInputDto)
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  locations?: CreateLocationInputDto[];

  @IsOptional()
  @Type(() => CreateContactInputDto)
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  contacts?: CreateContactInputDto[];

  @IsOptional()
  @Type(() => CreateShiftSkillInputDto)
  @ValidateNested({ each: true })
  @IsArray()
  shiftSkills?: CreateShiftSkillInputDto[];

  @IsOptional()
  @Type(() => CreateShiftManagerInputDto)
  @ValidateNested({ each: true })
  @IsArray()
  shiftManagers?: CreateShiftManagerInputDto[];
}
