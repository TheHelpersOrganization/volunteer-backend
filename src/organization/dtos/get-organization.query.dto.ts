import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { Transform } from 'class-transformer';
import {
  stringToBooleanTransform,
  stringToIntArrayTransform,
} from 'src/common/transformers';
import { PaginationQueryDto } from '../../common/dtos';
import { OrganizationMemberStatus, OrganizationStatus } from '../constants';

export enum OrganizationInclude {
  File = 'file',
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
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(organizationIncludes.length)
  @IsEnum(OrganizationInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  include?: OrganizationInclude[];
}
