export enum ShiftVolunteerStatus {
  Pending = 'pending',
  Cancelled = 'cancelled',
  Approved = 'approved',
  Rejected = 'rejected',
  Removed = 'removed',
  Left = 'left',
}

export const shiftVolunteerStatuses = Object.values(ShiftVolunteerStatus);
