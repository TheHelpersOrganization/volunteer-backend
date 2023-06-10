import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';
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
