export const UPCOMING_ACTIVITY_THRESHOLD_HOUR = 7 * 24;

export enum ActivityStatus {
  Pending = 'pending',
  Ongoing = 'ongoing',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export const AVAILABLE_VOLUNTEER_ACTIVITY_STATUSES = [
  ActivityStatus.Pending,
  ActivityStatus.Ongoing,
  ActivityStatus.Completed,
];

export const NOT_AVAILABLE_VOLUNTEER_ACTIVITY_STATUSES = [
  ActivityStatus.Cancelled,
];
