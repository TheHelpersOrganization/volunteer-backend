import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { Transform } from 'class-transformer';
import { stringToBoolean } from 'src/common/transformers';
import { PaginationQueryDto } from '../../common/dtos';
import { OrganizationMemberStatus, OrganizationStatus } from '../constants';

export class OrganizationQueryDto extends PaginationQueryDto {
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
  @Transform(stringToBoolean)
  @IsBoolean()
  joined?: boolean;

  @IsOptional()
  @Transform(stringToBoolean)
  @IsBoolean()
  owner?: boolean;
}
