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
  actionTitle?: string;

  @Expose()
  actionUrl?: string;

  @Expose()
  createdAt?: Date;

  // Metadata fields

  @Expose()
  _count?: number;
}
