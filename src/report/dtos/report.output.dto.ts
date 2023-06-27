import { Expose, Type } from 'class-transformer';
import { ActivityOutputDto } from 'src/activity/dtos';
import { FileOutputDto } from 'src/file/dtos';
import { OrganizationOutputDto } from 'src/organization/dtos';
import { ProfileOutputDto } from 'src/profile/dtos';
import { ReportStatus, ReportType } from '../constants';

export class ReportMessage {
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
  @Type(() => ReportMessage)
  messages?: ReportMessage[];

  @Expose()
  reportedAccount?: ProfileOutputDto;

  @Expose()
  reportedOrganization?: OrganizationOutputDto;

  @Expose()
  reportedActivity?: ActivityOutputDto;
}
