import { Expose } from 'class-transformer';
import { IsEnum, IsIn } from 'class-validator';
import { ProfileOutputDto } from 'src/profile/dtos';
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
  name: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  grantedBy?: ProfileOutputDto;
}
