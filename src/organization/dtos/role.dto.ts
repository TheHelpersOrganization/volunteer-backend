import { ProfileOutputDto } from '@app/profile/dtos';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsIn } from 'class-validator';
import {
  OrganizationMemberRole,
  nonOwnerOrganizationMemberRoles,
} from '../constants';

export class GrantRoleInputDto {
  @IsIn(nonOwnerOrganizationMemberRoles)
  role: OrganizationMemberRole;
}

export class RevokeRoleInputDto {
  @IsEnum(nonOwnerOrganizationMemberRoles)
  role: OrganizationMemberRole;
}

export class MemberRoleOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  displayName?: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  grantedBy?: ProfileOutputDto;
}

export class MemberRolesOutputDto {
  @Expose()
  @Type(() => MemberRoleOutputDto)
  assignedRoles: MemberRoleOutputDto[];

  @Expose()
  @Type(() => MemberRoleOutputDto)
  availableRoles: MemberRoleOutputDto[];

  @Expose()
  @Type(() => MemberRoleOutputDto)
  canGrantRoles: MemberRoleOutputDto[];

  @Expose()
  @Type(() => MemberRoleOutputDto)
  canRevokeRoles: MemberRoleOutputDto[];
}
