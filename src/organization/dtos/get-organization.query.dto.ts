import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationParamsDto } from '../../common/dtos';
import { OrganizationMemberStatus, OrganizationStatus } from '../constants';

export class OrganizationQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @IsOptional()
  @IsEnum(OrganizationMemberStatus)
  memberStatus?: OrganizationMemberStatus;

  @IsOptional()
  @IsBooleanString()
  joined?: boolean;

  @IsOptional()
  @IsBooleanString()
  owner?: boolean;
}
