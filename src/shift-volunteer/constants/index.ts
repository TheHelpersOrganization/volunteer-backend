export const MAX_SHIFT_RATING_COMMENT_LENGTH = 200;

export enum ShiftVolunteerStatus {
  Pending = 'pending',
  Cancelled = 'cancelled',
  Approved = 'approved',
  Rejected = 'rejected',
  Removed = 'removed',
  Left = 'left',
}

export const shiftVolunteerStatuses = Object.values(ShiftVolunteerStatus);
