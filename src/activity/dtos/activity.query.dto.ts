import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsISO31661Alpha2,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import {
  separatedCommaNumberArrayTransform,
  stringToBoolean,
} from 'src/common/transformers';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import { ActivityStatus } from '../constants';

export enum GetActivityInclude {
  Shift = 'shift',
  Me = 'me',
}

export enum GetActivitySort {
  NameAsc = 'name',
  NameDesc = '-name',
  StartTimeAsc = 'startTime',
  StartTimeDesc = '-startTime',
  EndTimeAsc = 'endTime',
  EndTimeDesc = '-endTime',
}

export class BaseGetActivityQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Start date range
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  startTime?: Date[];

  // End date range
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  endTime?: Date[];

  // Number of participants
  @IsOptional()
  @IsNumber()
  numberOfParticipants?: number;

  // Available slots
  @IsOptional()
  @IsNumberString()
  availableSlots?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBoolean)
  isManager?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBoolean)
  isShiftManager?: boolean;

  // Skills
  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Transform(separatedCommaNumberArrayTransform)
  skill?: number[];

  // Locality
  @IsOptional()
  @IsString()
  locality?: string;

  // Region
  @IsOptional()
  @IsString()
  region?: string;

  // Country
  @IsOptional()
  @IsISO31661Alpha2()
  country?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsNumberString()
  @Min(0)
  radius?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(GetActivityInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  include?: GetActivityInclude[];

  @IsOptional()
  @IsArray()
  @IsEnum(GetActivitySort, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  sort?: GetActivitySort[];
}

export class GetActivityByIdQueryDto extends BaseGetActivityQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @Transform(({ value }) => value.split(',').map(String))
  status?: ActivityStatus[];

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Transform(({ value }) => value.split(',').map(Number))
  org?: number[];

  @IsOptional()
  @IsArray()
  @IsEnum(ShiftVolunteerStatus, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  joinStatus?: ShiftVolunteerStatus[];
}

export class GetActivitiesQueryDto extends GetActivityByIdQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber(undefined, { each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];
}

export class ModGetActivitiesQueryDto extends BaseGetActivityQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ActivityStatus, { each: true })
  @Transform(({ value }) => value.split(',').map(String))
  status?: ActivityStatus[];
}
