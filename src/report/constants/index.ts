export enum ReportType {
  Account = 'account',
  Organization = 'organization',
  Activity = 'activity',
}

export const reportTypes = Object.values(ReportType);

export enum ReportStatus {
  Pending = 'pending',
  Reviewing = 'reviewing',
  Completed = 'completed',
}

export const reportStatuses = Object.values(ReportStatus);
