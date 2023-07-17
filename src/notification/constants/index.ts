export enum NotificationType {
  System = 'system',
  Activity = 'activity',
  Shift = 'shift',
  Organization = 'organization',
  Report = 'report',
  Chat = 'chat',
  Other = 'other',
}

export const accountNotificationPrefix = 'notification-account';

export const notificationTypes = Object.values(NotificationType);
