import { ActivityOutputDto } from '@app/activity/dtos';
import { OrganizationOutputDto } from '@app/organization/dtos';
import { ReportOutputDto } from '@app/report/dtos';
import { ShiftOutputDto } from '@app/shift/dtos';
import { Expose } from 'class-transformer';
import { NotificationType } from '../constants';

export class NotificationOutputDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  from?: string;

  @Expose()
  type: NotificationType;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  shortDescription?: string;

  @Expose()
  read: boolean;

  @Expose()
  pushOnly: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  activityId?: number;

  @Expose()
  activity?: ActivityOutputDto;

  @Expose()
  shiftId?: number;

  @Expose()
  shift?: ShiftOutputDto;

  @Expose()
  organizationId?: number;

  @Expose()
  organization?: OrganizationOutputDto;

  @Expose()
  reportId?: number;

  @Expose()
  report?: ReportOutputDto;

  // Metadata fields

  @Expose()
  _count?: number;
}
