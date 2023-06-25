import { faker } from '@faker-js/faker';
import { Account, Notification, PrismaClient } from '@prisma/client';
import { getNextNotificationId } from './utils';

export const seedNotifications = async (
  prisma: PrismaClient,
  accounts: Account[],
) => {
  const notifications: Notification[] = [];

  accounts.forEach((account) => {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (let i = 0; i < faker.number.int({ min: 5, max: 30 }); i++) {
      notifications.push({
        id: getNextNotificationId(),
        title: faker.lorem.sentence(),
        from: 'The Helpers App',
        description: faker.lorem.paragraphs(),
        shortDescription: faker.lorem.sentence(),
        accountId: account.id,
        read: faker.datatype.boolean(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  await prisma.notification.createMany({
    data: notifications,
  });
};
