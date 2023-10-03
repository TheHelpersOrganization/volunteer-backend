import {
  NotificationType,
  notificationTypes,
} from '@app/notification/constants';
import {
  NotificationTemplate,
  createNewActivityNotification,
  memberApprovedNotification,
  memberAssignedAsActivityManagerNotification,
  memberAssignedAsShiftManagerNotification,
  memberRejectedNotification,
  memberRemovedNotification,
  modMemberApprovedNotification,
  modMemberRemovedNotification,
  modVolunteerRemovedNotification,
  reportApprovedNotification,
  reportRejectedNotification,
  volunteerApprovedNotification,
  volunteerApprovedNotificationToMod,
  volunteerRejectedNotification,
  volunteerRemovedNotification,
} from '@app/notification/constants/notifications';
import { faker } from '@faker-js/faker';
import {
  Account,
  Activity,
  Chat,
  Organization,
  Prisma,
  PrismaClient,
  Profile,
  Report,
  Shift,
} from '@prisma/client';
import _ from 'lodash';
import { getNextNotificationId, requireNonNullish } from './utils';

export const seedNotifications = async (
  prisma: PrismaClient,
  accounts: Account[],
  profiles: Profile[],
  activities: Activity[],
  shifts: Shift[],
  organizations: Organization[],
  reports: Report[],
  chat: Chat[],
  options?: {
    runWithoutDb?: boolean;
  },
) => {
  const notifications: Prisma.NotificationUncheckedCreateInput[] = [];

  accounts.forEach((account) => {
    const profile = profiles.find((p) => p.id === account.id);
    const createdAt = faker.date.past();
    const updateAt = faker.date.future({ refDate: createdAt });

    notifications.push({
      id: getNextNotificationId(),
      title: 'Welcome to the The Helpers App!',
      from: 'The Helpers App',
      description:
        'Thank you for joining us! We hope you enjoy your stay. Start by joining a organization or volunteering for an activity!',
      shortDescription:
        'Thank you for joining us!. Start by joining a organization or volunteering for an activity!',
      accountId: account.id,
      read: false,
      type: NotificationType.System,

      createdAt: createdAt,
      updatedAt: updateAt,
    });

    for (let i = 0; i < faker.number.int({ min: 10, max: 30 }); i++) {
      const type = requireNonNullish(_.sample(notificationTypes));
      let activityId: number | undefined = undefined;
      let shiftId: number | undefined = undefined;
      let organizationId: number | undefined = undefined;
      let reportId: number | undefined = undefined;
      let chatId: number | undefined = undefined;

      let title: string | undefined = undefined;
      let description: string | undefined = undefined;
      let shortDescription: string | undefined = undefined;

      if (type == NotificationType.Activity) {
        const activity = _.sample(activities);
        const organization = organizations.find(
          (o) => o.id === activity?.organizationId,
        );
        activityId = activity?.id;
        const r = faker.number.int({ min: 0, max: 1 });
        if (r == 0) {
          const n = createNewActivityNotification({
            activityName: activity?.name ?? '',
            organizationName: organization?.name ?? '',
          });
          title = n.title;
          description = n.description;
          shortDescription = n.shortDescription;
        } else if (r == 1) {
          const n = memberAssignedAsActivityManagerNotification({
            activityName: activity?.name ?? '',
            organizationName: organization?.name ?? '',
          });
          title = n.title;
          description = n.description;
          shortDescription = n.shortDescription;
        }
      } else if (type == NotificationType.Shift) {
        const activity = _.sample(activities);
        const organization = organizations.find(
          (o) => o.id === activity?.organizationId,
        );
        const shift = _.sample(
          shifts.filter((s) => s.activityId === activity?.id),
        );
        activityId = activity?.id;
        shiftId = shift?.id;
        const r = faker.number.int({ min: 0, max: 5 });
        let notificationTemplate: NotificationTemplate;
        if (r == 0) {
          notificationTemplate = memberAssignedAsShiftManagerNotification({
            activityName: activity?.name ?? '',
            organizationName: organization?.name ?? '',
            shiftName: shift?.name ?? '',
          });
        } else if (r == 1) {
          notificationTemplate = volunteerApprovedNotification({
            activityName: activity?.name ?? '',
            shiftName: shift?.name ?? '',
          });
        } else if (r == 2) {
          notificationTemplate = volunteerApprovedNotificationToMod({
            activityName: activity?.name ?? '',
            shiftName: shift?.name ?? '',
            accountName: profile?.username ?? '',
          });
        } else if (r == 3) {
          notificationTemplate = volunteerRejectedNotification({
            activityName: activity?.name ?? '',
            shiftName: shift?.name ?? '',
          });
        } else if (r == 4) {
          notificationTemplate = volunteerRemovedNotification({
            activityName: activity?.name ?? '',
            shiftName: shift?.name ?? '',
          });
        } else {
          notificationTemplate = modVolunteerRemovedNotification({
            activityName: activity?.name ?? '',
            shiftName: shift?.name ?? '',
            accountName: profile?.username ?? '',
          });
        }
        title = notificationTemplate.title;
        description = notificationTemplate.description;
        shortDescription = notificationTemplate.shortDescription;
      } else if (type == NotificationType.Organization) {
        const organization = _.sample(organizations);
        organizationId = organization?.id;
        const r = faker.number.int({ min: 0, max: 4 });
        let notificationTemplate: NotificationTemplate;
        if (r == 0) {
          notificationTemplate = memberApprovedNotification({
            organizationName: organization?.name ?? '',
          });
        } else if (r == 1) {
          notificationTemplate = modMemberApprovedNotification({
            organizationName: organization?.name ?? '',
            accountName: profile?.username ?? '',
          });
        } else if (r == 2) {
          notificationTemplate = memberRejectedNotification({
            organizationName: organization?.name ?? '',
          });
        } else if (r == 3) {
          notificationTemplate = memberRemovedNotification({
            organizationName: organization?.name ?? '',
          });
        } else {
          notificationTemplate = modMemberRemovedNotification({
            organizationName: organization?.name ?? '',
            accountName: profile?.username ?? '',
          });
        }
        title = notificationTemplate.title;
        description = notificationTemplate.description;
        shortDescription = notificationTemplate.shortDescription;
      } else if (type == NotificationType.Report) {
        const report = _.sample(reports);
        reportId = report?.id;
        const r = faker.number.int({ min: 0, max: 1 });
        let notificationTemplate: NotificationTemplate;
        if (r == 0) {
          notificationTemplate = reportApprovedNotification({
            reportName: report?.title ?? '',
          });
        } else {
          notificationTemplate = reportRejectedNotification({
            reportName: report?.title ?? '',
          });
        }
        title = notificationTemplate.title;
        description = notificationTemplate.description;
        shortDescription = notificationTemplate.shortDescription;
      } else if (type == NotificationType.Chat) {
        chatId = _.sample(chat)?.id;
      }
      const createdAt = faker.date.past();
      const updateAt = faker.date.future({ refDate: createdAt });
      notifications.push({
        id: getNextNotificationId(),
        title: title ?? faker.lorem.sentence(),
        from: 'The Helpers App',
        description: description ?? faker.lorem.paragraphs(),
        shortDescription: shortDescription ?? faker.lorem.sentence(),
        accountId: account.id,
        read: faker.datatype.boolean(),
        type: type,
        pushOnly: type == NotificationType.Chat ? true : false,
        activityId: activityId,
        shiftId: shiftId,
        organizationId: organizationId,
        reportId: reportId,
        createdAt: createdAt,
        updatedAt: updateAt,
      });
    }
  });

  if (options?.runWithoutDb) {
    return {
      notifications: notifications,
    };
  }

  await prisma.notification.createMany({
    data: notifications,
  });

  return {
    notifications: notifications,
  };
};
