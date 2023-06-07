import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';

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
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  activityId?: number;

  @IsOptional()
  @IsArray()
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
