import { ProfileOutputDto } from '@app/profile/dtos';
import { Expose } from 'class-transformer';

export class NewsOutputDto {
  @Expose()
  id: number;

  @Expose()
  organizationId: number;

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
  isPublished: boolean;

  @Expose()
  publishedAt: Date;

  @Expose()
  updatedAt: Date;
}
