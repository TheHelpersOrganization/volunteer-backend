import { ActivityOutputDto } from '@app/activity/dtos';
import { FileOutputDto } from '@app/file/dtos';
import { OrganizationOutputDto } from '@app/organization/dtos';
import { ProfileOutputDto } from '@app/profile/dtos';
import { Expose, Type } from 'class-transformer';
import { ReportStatus, ReportType } from '../constants';

export class ReportMessageOutputDto {
  @Expose()
  id: number;

  @Expose()
  senderId: number;

  @Expose()
  @Type(() => ProfileOutputDto)
  sender?: ProfileOutputDto;

  @Expose()
  content: string;

  @Expose()
  @Type(() => FileOutputDto)
  files: FileOutputDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class ReportOutputDto {
  @Expose()
  id: number;

  @Expose()
  type: ReportType;

  @Expose()
  status: ReportStatus;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  reporterId: number;

  @Expose()
  @Type(() => ProfileOutputDto)
  reporter?: ProfileOutputDto;

  @Expose()
  reviewerId: number;

  @Expose()
  @Type(() => ProfileOutputDto)
  reviewer?: ProfileOutputDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ReportMessageOutputDto)
  messages?: ReportMessageOutputDto[];

  @Expose()
  reportedAccount?: ProfileOutputDto;

  @Expose()
  reportedOrganization?: OrganizationOutputDto;

  @Expose()
  reportedActivity?: ActivityOutputDto;
}
