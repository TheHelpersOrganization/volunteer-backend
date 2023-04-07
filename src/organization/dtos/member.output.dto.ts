import { Expose, Type } from 'class-transformer';
import { ProfileOutputDto } from 'src/profile/dtos';
import { OrganizationMemberStatus } from '../constants';

export class MemberOutputDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  @Type(() => ProfileOutputDto)
  accountProfile: ProfileOutputDto;

  @Expose()
  organizationId: number;

  @Expose()
  status: OrganizationMemberStatus;

  @Expose()
  censorId?: number;

  @Expose()
  rejectionReason?: string;

  @Expose()
  updatedAt: Date;
}
