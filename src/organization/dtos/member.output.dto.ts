import { Expose } from 'class-transformer';
import { OrganizationMemberStatus } from '../constants';

export class MemberOutputDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  organizationId: number;

  @Expose()
  status: OrganizationMemberStatus;

  @Expose()
  censorId?: number;

  @Expose()
  rejectionReason?: string;
}
