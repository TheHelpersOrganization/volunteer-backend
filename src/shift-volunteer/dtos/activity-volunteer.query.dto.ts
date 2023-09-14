import { stringToIntArrayTransform } from '@app/common/transformers';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum ActivityVolunteerInclude {
  Profile = 'profile',
}

export const activityVolunteerIncludes = Object.values(
  ActivityVolunteerInclude,
);

export class ActivityVolunteerQueryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  activityId: number[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(activityVolunteerIncludes.length)
  @IsEnum(ActivityVolunteerInclude, { each: true })
  include?: ActivityVolunteerInclude[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limitPerActivity?: number;
}
