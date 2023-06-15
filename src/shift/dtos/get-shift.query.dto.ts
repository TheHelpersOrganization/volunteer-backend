import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';

export enum GetShiftInclude {
  ShiftSkill = 'shiftSkill',
  ShiftVolunteer = 'shiftVolunteer',
  ShiftManager = 'shiftManager',
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
  @Transform(({ value }) => value.split(',').filter((v) => v))
  joinStatus?: ShiftVolunteerStatus[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GetShiftInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  include?: GetShiftInclude[];
}

export class GetShiftQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetShiftInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  include?: GetShiftInclude[];
}
