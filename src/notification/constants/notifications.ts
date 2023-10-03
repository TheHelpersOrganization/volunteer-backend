import { NotificationType } from '.';

export class NotificationTemplate {
  type: NotificationType;
  title: string;
  description: string;
  shortDescription: string;
}

// Activity Notifications
export const createNewActivityNotification = (data: {
  activityName: string;
  organizationName: string;
}): NotificationTemplate => {
  const { activityName, organizationName } = data;

  return {
    type: NotificationType.Activity,
    title: 'New Activity',
    shortDescription: `New activity ${activityName} has been created for ${organizationName}.`,
    description: `New activity ${activityName} has been created for ${organizationName}.`,
  };
};

export const memberAssignedAsActivityManagerNotification = (data: {
  activityName: string;
  organizationName: string;
}): NotificationTemplate => {
  const { activityName, organizationName } = data;

  return {
    type: NotificationType.Activity,
    title: 'You have been assigned as activity manager',
    shortDescription: `You have been assigned as activity manager for activity ${activityName} of ${organizationName}.`,
    description: `You have been assigned as activity manager for activity ${activityName} of ${organizationName}.`,
  };
};

export const memberAssignedAsShiftManagerNotification = (data: {
  activityName: string;
  shiftName: string;
  organizationName: string;
}): NotificationTemplate => {
  const { activityName, shiftName, organizationName } = data;

  return {
    type: NotificationType.Shift,
    title: 'You have been assigned as shift manager',
    shortDescription: `You have been assigned as shift manager for shift ${shiftName} of activity ${activityName}`,
    description: `You have been assigned as shift manager for shift ${shiftName} of activity ${activityName}.`,
  };
};

export const volunteerApprovedNotification = (data: {
  activityName: string;
  shiftName: string;
}): NotificationTemplate => {
  const { activityName, shiftName } = data;

  return {
    type: NotificationType.Shift,
    title: `Application to shift ${shiftName} has been approved`,
    shortDescription: `You have been approved to join shift ${shiftName} of activity ${activityName}.`,
    description: `You have been approved for the shift ${shiftName} of activity ${activityName}.`,
  };
};

export const volunteerApprovedNotificationToMod = (data: {
  activityName: string;
  shiftName: string;
  accountName: string;
}): NotificationTemplate => {
  const { activityName, shiftName, accountName } = data;

  return {
    type: NotificationType.Shift,
    title: `${accountName} has been approved to join shift ${shiftName}`,
    shortDescription: `${accountName} has been approved to join ${shiftName} of activity ${activityName}.`,
    description: `${accountName} has been approved to join ${shiftName} of activity ${activityName}.`,
  };
};

export const volunteerRejectedNotification = (data: {
  activityName: string;
  shiftName: string;
}): NotificationTemplate => {
  const { activityName, shiftName } = data;

  return {
    type: NotificationType.Shift,
    title: `Application to shift ${shiftName} has been rejected`,
    shortDescription: `You have been rejected to join ${shiftName} of activity ${activityName}.`,
    description: `You have been rejected to join ${shiftName} of activity ${activityName}.`,
  };
};

export const volunteerRemovedNotification = (data: {
  activityName: string;
  shiftName: string;
}): NotificationTemplate => {
  const { activityName, shiftName } = data;

  return {
    type: NotificationType.Shift,
    title: `You have been removed from shift ${shiftName}`,
    shortDescription: `You have been removed from shift ${shiftName} of activity ${activityName}.`,
    description: `You have been removed from shift ${shiftName} of activity ${activityName}.`,
  };
};

export const modVolunteerRemovedNotification = (data: {
  activityName: string;
  shiftName: string;
  accountName: string;
}): NotificationTemplate => {
  const { activityName, shiftName, accountName } = data;

  return {
    type: NotificationType.Shift,
    title: `${accountName} has been removed from shift ${shiftName}`,
    shortDescription: `${accountName} has been removed from shift ${shiftName} of activity ${activityName}.`,
    description: `${accountName} has been removed from shift ${shiftName} of activity ${activityName}.`,
  };
};

export const memberApprovedNotification = (data: {
  organizationName: string;
}): NotificationTemplate => {
  const { organizationName } = data;

  return {
    type: NotificationType.Organization,
    title: `You have been approved to join ${organizationName}`,
    shortDescription: `You have been approved to join ${organizationName}.`,
    description: `You have been approved to join ${organizationName}.`,
  };
};

export const modMemberApprovedNotification = (data: {
  organizationName: string;
  accountName: string;
}): NotificationTemplate => {
  const { organizationName, accountName } = data;

  return {
    type: NotificationType.Organization,
    title: `${accountName} has been approved to join ${organizationName}`,
    shortDescription: `${accountName} has been approved to join ${organizationName}.`,
    description: `${accountName} has been approved to join ${organizationName}.`,
  };
};

export const memberRejectedNotification = (data: {
  organizationName: string;
}): NotificationTemplate => {
  const { organizationName } = data;

  return {
    type: NotificationType.Organization,
    title: `You have been rejected to join ${organizationName}`,
    shortDescription: `You have been rejected to join ${organizationName}.`,
    description: `You have been rejected to join ${organizationName}.`,
  };
};

export const memberRemovedNotification = (data: {
  organizationName: string;
}): NotificationTemplate => {
  const { organizationName } = data;

  return {
    type: NotificationType.Organization,
    title: `You have been removed from ${organizationName}`,
    shortDescription: `You have been removed from ${organizationName}.`,
    description: `You have been removed from ${organizationName}.`,
  };
};

export const modMemberRemovedNotification = (data: {
  organizationName: string;
  accountName: string;
}): NotificationTemplate => {
  const { organizationName, accountName } = data;

  return {
    type: NotificationType.Organization,
    title: `${accountName} has been removed from ${organizationName}`,
    shortDescription: `${accountName} has been removed from ${organizationName}.`,
    description: `${accountName} has been removed from ${organizationName}.`,
  };
};

export const reportApprovedNotification = (data: {
  reportName: string;
}): NotificationTemplate => {
  const { reportName } = data;

  return {
    type: NotificationType.Report,
    title: `Your report ${reportName} has been approved`,
    shortDescription: `Your report ${reportName} has been approved.`,
    description: `Your report ${reportName} has been approved.`,
  };
};

export const reportRejectedNotification = (data: {
  reportName: string;
}): NotificationTemplate => {
  const { reportName } = data;

  return {
    type: NotificationType.Report,
    title: `Your report ${reportName} has been rejected`,
    shortDescription: `Your report ${reportName} has been rejected.`,
    description: `Your report ${reportName} has been rejected.`,
  };
};
