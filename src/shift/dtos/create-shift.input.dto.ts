import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateContactInputDto } from 'src/contact/dtos';
import { CreateLocationInputDto } from 'src/location/dtos';

import { CreateShiftManagerInputDto, CreateShiftSkillInputDto } from '.';
import {
  SHIFT_DESCRIPTION_MAX_LENGTH,
  SHIFT_NAME_MAX_LENGTH,
} from '../constants';

export class CreateShiftInputDto {
  @IsInt()
  activityId: number;

  @IsString()
  @MaxLength(SHIFT_NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @MaxLength(SHIFT_DESCRIPTION_MAX_LENGTH)
  description: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  @ValidateIf((target, value) => value >= target.startTime)
  endTime: Date;

  @IsOptional()
  @IsNumber()
  numberOfParticipants?: number;

  @Type(() => CreateLocationInputDto)
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  locations: CreateLocationInputDto[];

  @Type(() => CreateContactInputDto)
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  contacts: CreateContactInputDto[];

  @Type(() => CreateShiftSkillInputDto)
  @ValidateNested({ each: true })
  @IsArray()
  shiftSkills: CreateShiftSkillInputDto[];

  @Type(() => CreateShiftManagerInputDto)
  @ValidateNested({ each: true })
  @IsArray()
  shiftManagers: CreateShiftManagerInputDto[];
}
