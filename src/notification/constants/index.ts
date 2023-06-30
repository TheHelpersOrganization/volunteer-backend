export enum NotificationType {
  System = 'system',
  Activity = 'activity',
  Shift = 'shift',
  Organization = 'organization',
  Report = 'report',
  Other = 'other',
}

export const notificationTypes = Object.values(NotificationType);
