import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { OrganizationMemberStatus } from '../constants';

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
  @IsArray()
  @Transform(({ value }) => value.split(',').map(String))
  @IsEnum(OrganizationMemberStatus, { each: true })
  statuses?: OrganizationMemberStatus[];
}
