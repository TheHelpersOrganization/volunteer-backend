import { ActivityOutputDto } from '@app/activity/dtos';
import { OrganizationOutputDto } from '@app/organization/dtos';
import { ProfileOutputDto } from '@app/profile/dtos';
import { Expose } from 'class-transformer';
import { NewsContentFormat, NewsType } from '../constants';

export class NewsOutputDto {
  @Expose()
  id: number;

  @Expose()
  type: NewsType;

  @Expose()
  organizationId: number;

  @Expose()
  organization?: OrganizationOutputDto;

  @Expose()
  authorId: number;

  @Expose()
  author?: ProfileOutputDto;

  @Expose()
  thumbnail: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  contentFormat: NewsContentFormat;

  @Expose()
  views: number;

  @Expose()
  popularity: number;

  @Expose()
  isPublished: boolean;

  @Expose()
  activityId?: number;

  @Expose()
  activity?: ActivityOutputDto;

  @Expose()
  publishedAt: Date;

  @Expose()
  updatedAt: Date;
}
