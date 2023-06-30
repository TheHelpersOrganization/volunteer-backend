import { faker } from '@faker-js/faker';
import {
  Account,
  Activity,
  Organization,
  Prisma,
  PrismaClient,
  Report,
} from '@prisma/client';
import * as _ from 'lodash';
import {
  NotificationType,
  notificationTypes,
} from 'src/notification/constants';
import { getNextNotificationId, requireNonNullish } from './utils';

export const seedNotifications = async (
  prisma: PrismaClient,
  accounts: Account[],
  activities: Activity[],
  organizations: Organization[],
  reports: Report[],
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
      data: {},
      createdAt: createdAt,
      updatedAt: updateAt,
    });

    for (let i = 0; i < faker.number.int({ min: 10, max: 30 }); i++) {
      const type = requireNonNullish(_.sample(notificationTypes));
      const data = {};
      switch (type) {
        case NotificationType.Activity:
          data['activityId'] = _.sample(activities)?.id;
          break;
        case NotificationType.Organization:
          data['organizationId'] = _.sample(organizations)?.id;
          break;
        case NotificationType.Report:
          data['reportId'] = _.sample(reports)?.id;
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
        data: data,
        createdAt: createdAt,
        updatedAt: updateAt,
      });
    }
  });

  const res = await prisma.notification.createMany({
    data: notifications,
  });

  return {
    notifications: res,
  };
};
