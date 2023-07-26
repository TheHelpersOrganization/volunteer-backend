import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { stringToIntArrayTransform } from 'src/common/transformers';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  organizationMemberRoles,
} from '../constants';

export enum GetMemberInclude {
  Profile = 'profile',
  Role = 'role',
  RoleGranter = 'roleGranter',
}

export const getMemberIncludes = Object.values(GetMemberInclude);

export class GetMemberByIdQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(',').map(String))
  @IsEnum(GetMemberInclude, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(getMemberIncludes.length)
  include?: GetMemberInclude[];
}

export class GetMemberQueryDto extends GetMemberByIdQueryDto {
  @IsOptional()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Transform(stringToIntArrayTransform)
  id: number[];

  @IsOptional()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Transform(stringToIntArrayTransform)
  notId: number[];

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(',').map(String))
  @IsEnum(OrganizationMemberRole, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(organizationMemberRoles.length)
  role?: OrganizationMemberRole[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(',').map(String))
  @IsEnum(OrganizationMemberStatus, { each: true })
  statuses?: OrganizationMemberStatus[];
}
