import { CreateLocationInputDto } from '@app/location/dtos';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { IsOnTheSameDay } from '@app/common/validators';
import { CreateShiftSkillInputDto } from '@app/shift-skill/dtos';
import { CreateShiftManagerInputDto } from '.';
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

  @IsDate()
  @Transform(({ value }) => new Date(value))
  startTime: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @ValidateIf((target, value) => new Date(value) >= new Date(target.startTime))
  @IsOnTheSameDay({ ref: 'startTime' })
  endTime: Date;

  @IsOptional()
  @IsNumber()
  numberOfParticipants?: number;

  @IsOptional()
  @Type(() => CreateLocationInputDto)
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  locations?: CreateLocationInputDto[];

  // @IsOptional()
  // @Type(() => CreateContactInputDto)
  // @ValidateNested({ each: true })
  // @ArrayNotEmpty()
  // contacts?: CreateContactInputDto[];

  @IsOptional()
  @IsInt({ each: true })
  @IsArray()
  contacts?: number[];

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
