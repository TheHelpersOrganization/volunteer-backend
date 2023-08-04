import {
  NotificationType,
  notificationTypes,
} from '@app/notification/constants';
import { faker } from '@faker-js/faker';
import {
  Account,
  Activity,
  Chat,
  Organization,
  Prisma,
  PrismaClient,
  Report,
  Shift,
} from '@prisma/client';
import _ from 'lodash';
import { getNextNotificationId, requireNonNullish } from './utils';

export const seedNotifications = async (
  prisma: PrismaClient,
  accounts: Account[],
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
      switch (type) {
        case NotificationType.Activity:
          activityId = _.sample(activities)?.id;
          break;
        case NotificationType.Shift:
          activityId = _.sample(activities)?.id;
          shiftId = _.sample(shifts.filter((s) => s.activityId === activityId))
            ?.id;
          break;
        case NotificationType.Organization:
          organizationId = _.sample(organizations)?.id;
          break;
        case NotificationType.Report:
          reportId = _.sample(reports)?.id;
          break;
        case NotificationType.Chat:
          chatId = _.sample(chat)?.id;
          break;
      }
      const createdAt = faker.date.past();
      const updateAt = faker.date.future({ refDate: createdAt });
      notifications.push({
        id: getNextNotificationId(),
        title: faker.lorem.sentence(),
        from: 'The Helpers App',
        description: faker.lorem.paragraphs(),
        shortDescription: faker.lorem.sentence(),
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
