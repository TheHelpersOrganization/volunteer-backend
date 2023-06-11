import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';
import { stringToBoolean } from 'src/common/transformers';
import { ShiftVolunteerStatus } from '../constants';

export enum ShiftVolunteerInclude {
  Profile = 'profile',
}

export class GetShiftVolunteerQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map((v) => parseInt(v)))
  id?: number[];

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  shiftId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  activityId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBoolean)
  mine?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(ShiftVolunteerStatus, { each: true })
  @Transform(({ value }) => value.split(','))
  status?: ShiftVolunteerStatus[];

  @IsOptional()
  @IsArray()
  @IsEnum(ShiftVolunteerInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  include?: ShiftVolunteerInclude[];
}
