export const EMAIL_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 20000;

export enum OrganizationStatus {
  Pending = 'pending',
  Cancelled = 'cancelled',
  Verified = 'verified',
  Rejected = 'rejected',
}

export enum OrganizationMemberRole {
  Owner = 'organizationOwner',
  Manager = 'organizationManager',
  MemberManager = 'organizationMemberManager',
  ActivityManager = 'organizationActivityManager',
}

export const OrganizationMemberRoleWeight = {
  [OrganizationMemberRole.Owner]: 100000,
  [OrganizationMemberRole.Manager]: 10000,
  [OrganizationMemberRole.MemberManager]: 1000,
  [OrganizationMemberRole.ActivityManager]: 100,
};

export const organizationMemberRoles = Object.values(OrganizationMemberRole);

export const nonOwnerOrganizationMemberRoles = organizationMemberRoles.filter(
  (role) => role !== OrganizationMemberRole.Owner,
);
