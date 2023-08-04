import { ProfileOutputDto } from '@app/profile/dtos';
import { Expose, Type } from 'class-transformer';
import { OrganizationMemberStatus } from '../constants';
import { MemberRoleOutputDto } from './role.dto';

export class MemberOutputDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  @Type(() => ProfileOutputDto)
  profile?: ProfileOutputDto;

  @Expose()
  organizationId: number;

  @Expose()
  status: OrganizationMemberStatus;

  @Expose()
  censorId?: number;

  @Expose()
  @Type(() => MemberRoleOutputDto)
  roles: MemberRoleOutputDto[];

  @Expose()
  rejectionReason?: string;

  @Expose()
  updatedAt: Date;
}
