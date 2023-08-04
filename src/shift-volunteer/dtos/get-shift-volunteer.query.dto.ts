import { PaginationQueryDto } from '@app/common/dtos';
import { stringToBooleanTransform } from '@app/common/transformers';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ShiftVolunteerStatus } from '../constants';

export enum ShiftVolunteerInclude {
  Profile = 'profile',
  Shift = 'shift',
}

export class GetShiftVolunteerQueryDto extends PaginationQueryDto {
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
  @Transform(stringToBooleanTransform)
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  mine?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  meetSkillRequirements?: boolean;

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
