import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsISO31661Alpha2,
  IsIn,
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
import { ShiftVolunteerStatus } from 'src/shift/constants';
import {
  AVAILABLE_VOLUNTEER_ACTIVITY_STATUSES,
  ActivityStatus,
} from '../constants';

export class BaseGetActivityQueryDto extends PaginationParamsDto {
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
  startDate?: Date[];

  // End date range
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsDate({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => new Date(Number(v))))
  endDate?: Date[];

  // Number of participants
  @IsOptional()
  @IsNumber()
  numberOfParticipants?: number;

  // Available slots
  @IsOptional()
  @IsNumberString()
  availableSlots?: number;

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
}

export class GetActivityByIdQueryDto extends BaseGetActivityQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(AVAILABLE_VOLUNTEER_ACTIVITY_STATUSES, { each: true })
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
