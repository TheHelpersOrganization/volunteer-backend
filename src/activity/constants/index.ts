import { Prisma } from '@prisma/client';

export const UPCOMING_ACTIVITY_THRESHOLD_HOUR = 7 * 24;

export enum ActivityStatus {
  Pending = 'pending',
  Ongoing = 'ongoing',
  Completed = 'completed',
}

export const activityMinimalSelect: Prisma.ActivitySelect = {
  name: true,
  thumbnail: true,
};
