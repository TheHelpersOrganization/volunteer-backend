export enum Role {
  Volunteer = 'volunteer',
  Moderator = 'moderator',
  Admin = 'admin',
  SuperAdmin = 'superadmin',
  // Permit all requests
  Operator = 'operator',
}

export const RolePriority = {
  [Role.Volunteer]: 100,
  [Role.Moderator]: 1000,
  [Role.Admin]: 10000,
  [Role.Operator]: 99999999,
};
