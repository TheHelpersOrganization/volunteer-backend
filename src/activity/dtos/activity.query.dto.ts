import { PaginationQueryDto } from '@app/common/dtos';
import {
  separatedCommaNumberArrayTransform,
  stringToBooleanTransform,
  stringToFloatTransform,
  stringToIntTransform,
} from '@app/common/transformers';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
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

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isDisabled?: boolean;

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
  @Transform(stringToBooleanTransform)
  isManager?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
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
  @Transform(stringToFloatTransform)
  lat?: number;

  @IsOptional()
  @IsLongitude()
  @Transform(stringToFloatTransform)
  lng?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(stringToIntTransform)
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

export class CountActivityQueryDto {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(Number(value)))
  startTime?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(Number(value)))
  endTime?: Date;
}
