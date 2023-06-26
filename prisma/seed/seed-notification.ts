import { faker } from '@faker-js/faker';
import { Account, Notification, PrismaClient } from '@prisma/client';
import * as _ from 'lodash';
import {
  NotificationType,
  notificationTypes,
} from 'src/notification/constants';
import { getNextNotificationId, requireNonNullish } from './utils';

export const seedNotifications = async (
  prisma: PrismaClient,
  accounts: Account[],
) => {
  const notifications: Notification[] = [];

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
        createdAt: createdAt,
        updatedAt: updateAt,
      });
    }
  });

  await prisma.notification.createMany({
    data: notifications,
  });
};
