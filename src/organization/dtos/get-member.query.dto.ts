import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { OrganizationMemberStatus } from '../constants';

export class GetMemberQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(OrganizationMemberStatus, { each: true })
  statuses?: OrganizationMemberStatus[];
}
