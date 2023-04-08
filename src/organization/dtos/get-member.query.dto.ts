import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { OrganizationMemberStatus } from '../constants';

export class GetMemberQueryDto {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(',').map(String))
  @IsEnum(OrganizationMemberStatus, { each: true })
  statuses?: OrganizationMemberStatus[];
}
