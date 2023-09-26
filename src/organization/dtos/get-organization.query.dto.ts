import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO31661Alpha2,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { CountQueryDto } from '@app/common/dtos/count.dto';
import {
  separatedCommaNumberArrayTransform,
  stringToBooleanTransform,
  stringToFloatTransform,
  stringToIntArrayTransform,
  stringToIntTransform,
} from '@app/common/transformers';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dtos';
import { OrganizationMemberStatus, OrganizationStatus } from '../constants';

export enum OrganizationInclude {
  File = 'file',
  NumberOfActivities = 'numberOfActivities',
}

export const organizationIncludes = Object.values(OrganizationInclude);

export class OrganizationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  id?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(128)
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  excludeId?: number[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isDisabled?: boolean;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @IsOptional()
  @IsEnum(OrganizationMemberStatus)
  memberStatus?: OrganizationMemberStatus;

  @IsOptional()
  @Transform(stringToBooleanTransform)
  @IsBoolean()
  joined?: boolean;

  @IsOptional()
  @Transform(stringToBooleanTransform)
  @IsBoolean()
  owner?: boolean;

  @IsOptional()
  @IsInt({ each: true })
  @Transform(separatedCommaNumberArrayTransform)
  skill?: number[];

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  region?: string;

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
  @IsInt({ each: true })
  @Transform(separatedCommaNumberArrayTransform)
  joinedAccount?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(organizationIncludes.length)
  @IsEnum(OrganizationInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  include?: OrganizationInclude[];
}

export class CountOrganizationQueryDto extends CountQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isDisabled?: boolean;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}
