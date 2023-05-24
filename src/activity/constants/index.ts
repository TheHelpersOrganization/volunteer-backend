export const UPCOMING_ACTIVITY_THRESHOLD_HOUR = 7 * 24;

export enum ActivityStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const AVAILABLE_VOLUNTEER_ACTIVITY_STATUSES = [
  ActivityStatus.PENDING,
  ActivityStatus.ONGOING,
  ActivityStatus.COMPLETED,
];

export const NOT_AVAILABLE_VOLUNTEER_ACTIVITY_STATUSES = [
  ActivityStatus.CANCELLED,
];
