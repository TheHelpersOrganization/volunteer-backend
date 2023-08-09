import { requireNonNull } from '@app/common/utils';
import { OrganizationMemberStatus } from '@app/organization/constants';
import { faker } from '@faker-js/faker';
import {
  Account,
  Member,
  News,
  Organization,
  PrismaClient,
} from '@prisma/client';
import { seedFiles } from './seed-file';
import { getNextNewsId } from './utils';

export const seedNews = async (
  prisma: PrismaClient,
  data: {
    organizations: Organization[];
    members: Member[];
    defaultAccounts: Account[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const news: News[] = [];
  const newsHasThumbnail: boolean[] = [];

  // Default organizations will have variety of news
  const defaultMembers = data.members.filter((member) =>
    data.defaultAccounts.some((acc) => acc.id === member.accountId),
  );
  const defaultOrganizations = data.organizations.filter((org) =>
    defaultMembers.some((member) => member.organizationId === org.id),
  );

  data.organizations.forEach((org) => {
    const isDefault = defaultOrganizations.some(
      (defaultOrg) => defaultOrg.id === org.id,
    );
    const organizationMembers = data.members.filter(
      (member) =>
        member.organizationId === org.id &&
        member.status === OrganizationMemberStatus.Approved,
    );
    const organizationDefaultMembers = defaultMembers.filter(
      (member) => member.organizationId === org.id,
    );

    let numberOfNews: number;
    if (!isDefault) {
      numberOfNews = faker.helpers.weightedArrayElement([
        {
          weight: 20,
          value: 0,
        },
        {
          weight: 10,
          value: 1,
        },
        {
          weight: 5,
          value: 2,
        },
        {
          weight: 1,
          value: 3,
        },
      ]);

      for (let i = 0; i < numberOfNews; i++) {
        const authorId =
          faker.helpers.arrayElement(organizationMembers).accountId;
        news.push(generateNews({ orgId: org.id, authorId: authorId }));
      }

      return;
    }

    // Default organizations will have variety of news
    const numberOfNewsCreatedByDefaultMembers = faker.number.int({
      min: 5,
      max: 10,
    });

    for (let i = 0; i < numberOfNewsCreatedByDefaultMembers; i++) {
      news.push(
        generateNews({
          orgId: org.id,
          authorId: faker.helpers.arrayElement(organizationDefaultMembers)
            .accountId,
        }),
      );
    }

    const numberOfNewsCreatedByNonDefaultMembers = faker.number.int({
      min: 0,
      max: 10,
    });

    for (let i = 0; i < numberOfNewsCreatedByNonDefaultMembers; i++) {
      news.push(
        generateNews({
          orgId: org.id,
          authorId: faker.helpers.arrayElement(organizationMembers).accountId,
        }),
      );
    }
  });

  news.forEach((news) => {
    const isDefault = defaultOrganizations.some(
      (defaultOrg) => defaultOrg.id === news.organizationId,
    );
    if (isDefault) {
      newsHasThumbnail.push(faker.datatype.boolean());
      return;
    }
    newsHasThumbnail.push(
      faker.helpers.weightedArrayElement([
        { weight: 1, value: true },
        { weight: 5, value: false },
      ]),
    );
  });

  const newsThumbnails = await seedFiles(
    prisma,
    './tmp/images/news-thumbnail',
    newsHasThumbnail.filter((hasThumbnail) => hasThumbnail).length,
    () =>
      faker.image.urlLoremFlickr({
        width: 1280,
        height: 720,
        category: 'volunteer',
      }),
    {
      skipInsertIntoDatabase: options?.skipInsertIntoDatabase,
    },
  );

  news.forEach((news, index) => {
    if (!newsHasThumbnail[index]) {
      return;
    }
    news.thumbnail = requireNonNull(newsThumbnails.shift()).id;
  });

  const returnData = { news };

  if (options?.skipInsertIntoDatabase) {
    return returnData;
  }

  await prisma.news.createMany({
    data: news,
  });

  return returnData;
};

const generateNews = (data: { orgId: number; authorId: number }) => {
  const isPublished = faker.datatype.boolean();
  const createdAt = faker.date.past();

  return {
    id: getNextNewsId(),
    title: faker.lorem.words({ min: 3, max: 10 }),
    content: faker.lorem.paragraphs({
      min: 3,
      max: 10,
    }),
    thumbnail: null,
    organizationId: data.orgId,
    views: isPublished ? faker.number.int({ min: 0, max: 300 }) : 0,
    authorId: data.authorId,
    isPublished: isPublished,
    publishedAt: createdAt,
    createdAt: createdAt,
    updatedAt: faker.date.between({
      from: createdAt,
      to: new Date(),
    }),
  };
};
