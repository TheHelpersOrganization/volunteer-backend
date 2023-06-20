import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';
import { stringToBoolean } from 'src/common/transformers';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import { ShiftStatus } from '../constants';

export enum GetShiftInclude {
  ShiftSkill = 'shiftSkill',
  ShiftVolunteer = 'shiftVolunteer',
  ShiftVolunteerProfile = 'shiftVolunteerProfile',
  MyShiftVolunteer = 'myShiftVolunteer',
  ShiftManager = 'shiftManager',
}

export enum GetShiftSort {
  StartTimeAscending = 'startTime',
  StartTimeDescending = '-startTime',
  EndTimeAscending = 'endTime',
  EndTimeDescending = '-endTime',
}

export class GetShiftsQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => parseInt(v)))
  id?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @Transform(({ value }) => value.split(',').map((v) => parseInt(v)))
  activityId?: number[];

  @IsOptional()
  @IsInt({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Transform(({ value }) => value.split(',').map((v) => parseInt(v)))
  org?: number[];

  @IsOptional()
  @IsString()
  name?: string;

  // Start time range
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  startTime?: Date[];

  // End time range
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  endTime?: Date[];

  // Number of participants
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => parseInt(v)))
  numberOfParticipants?: number[];

  // Available slots
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => parseInt(v)))
  availableSlots?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ShiftVolunteerStatus, { each: true })
  @Transform(({ value }) => value.split(','))
  myJoinStatus?: ShiftVolunteerStatus[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ShiftStatus, { each: true })
  @Transform(({ value }) => value.split(','))
  status?: ShiftStatus[];

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBoolean)
  isManager?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GetShiftInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  include?: GetShiftInclude[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GetShiftSort, { each: true })
  @Transform(({ value }) => value.split(','))
  sort?: GetShiftSort[];
}

export class GetShiftQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetShiftInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  include?: GetShiftInclude[];
}
