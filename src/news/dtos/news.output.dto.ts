import { OrganizationOutputDto } from '@app/organization/dtos';
import { ProfileOutputDto } from '@app/profile/dtos';
import { Expose } from 'class-transformer';
import { NewsContentFormat } from '../constants';

export class NewsOutputDto {
  @Expose()
  id: number;

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
  isPublished: boolean;

  @Expose()
  publishedAt: Date;

  @Expose()
  updatedAt: Date;
}
