export * from './organization.constant';

export enum OrganizationMemberStatus {
  // Upon registration
  Pending = 'pending',
  Cancelled = 'cancelled',

  // Registration handled
  Approved = 'approved',
  Rejected = 'rejected',
  Removed = 'removed',
  Leaved = 'leaved',
}
