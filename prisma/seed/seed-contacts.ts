import { faker } from '@faker-js/faker';
import { Account, Contact, PrismaClient } from '@prisma/client';
import { getNextContactId } from './utils';

export const seedContacts = async (
  prisma: PrismaClient,
  data: {
    accounts: Account[];
    runWithoutDb?: boolean;
  },
) => {
  const { accounts } = data;

  const contacts: Contact[] = [];

  accounts.forEach((account) => {
    const numberOfContacts = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < numberOfContacts; i++) {
      const contact: Contact = {
        id: getNextContactId(),
        name: faker.person.fullName(),
        accountId: account.id,
        email: faker.internet.exampleEmail(),
        phoneNumber: faker.phone.number(),
      };
      contacts.push(contact);
    }
  });

  if (data.runWithoutDb) {
    return {
      contacts,
    };
  }

  await prisma.contact.createMany({
    data: contacts,
  });

  return {
    contacts,
  };
};
