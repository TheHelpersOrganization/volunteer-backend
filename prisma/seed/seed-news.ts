import { requireNonNull } from '@app/common/utils';
import { NewsContentFormat, NewsType, newsTypes } from '@app/news/constants';
import { calculateNewsPopularity } from '@app/news/utils';
import {
  OrganizationMemberStatus,
  OrganizationStatus,
} from '@app/organization/constants';
import { faker } from '@faker-js/faker';
import {
  Account,
  Activity,
  Member,
  News,
  Organization,
  PrismaClient,
} from '@prisma/client';
import { readFileSync } from 'fs';
import _ from 'lodash';
import path from 'path';
import { seedFiles } from './seed-file';
import { getNextNewsId } from './utils';

export const seedNews = async (
  prisma: PrismaClient,
  data: {
    defaultAccounts: Account[];
    organizations: Organization[];
    members: Member[];
    activities: Activity[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const news: News[] = [];
  const newsHasThumbnail: boolean[] = [];
  const newsTemplates = loadNews(
    path.join(__dirname, `./assets/volunteer-news.txt`),
  );

  // Default organizations will have variety of news
  const verifiedOrganizations = data.organizations.filter(
    (org) => org.status === OrganizationStatus.Verified,
  );
  const defaultMembers = data.members.filter((member) =>
    data.defaultAccounts.some((acc) => acc.id === member.accountId),
  );
  const defaultOrganizations = data.organizations.filter((org) =>
    defaultMembers.some((member) => member.organizationId === org.id),
  );

  verifiedOrganizations
    .filter((o) => o.status == OrganizationStatus.Verified)
    .forEach((org) => {
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
      const organizationActivityIds = data.activities
        .filter((activity) => activity.organizationId === org.id)
        .map((activity) => activity.id);

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

          news.push(
            generateNews({
              orgId: org.id,
              authorId: authorId,
              activityIds: organizationActivityIds,
              template: newsTemplates[i % newsTemplates.length],
            }),
          );
        }

        return;
      }

      // Default organizations will have variety of news
      const numberOfNewsCreatedByDefaultMembers = faker.number.int({
        min: 1,
        max: 5,
      });

      for (let i = 0; i < numberOfNewsCreatedByDefaultMembers; i++) {
        news.push(
          generateNews({
            orgId: org.id,
            authorId: faker.helpers.arrayElement(organizationDefaultMembers)
              .accountId,
            activityIds: organizationActivityIds,
            template: newsTemplates[i % newsTemplates.length],
          }),
        );
      }

      const numberOfNewsCreatedByNonDefaultMembers = faker.number.int({
        min: 0,
        max: 3,
      });

      for (let i = 0; i < numberOfNewsCreatedByNonDefaultMembers; i++) {
        news.push(
          generateNews({
            orgId: org.id,
            authorId: faker.helpers.arrayElement(organizationMembers).accountId,
            activityIds: organizationActivityIds,
            template: newsTemplates[i % newsTemplates.length],
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
        { weight: 3, value: true },
        { weight: 1, value: false },
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

const generateNews = (data: {
  orgId: number;
  authorId: number;
  activityIds: number[];
  template: NewsTemplate;
}) => {
  const type = faker.helpers.arrayElement(newsTypes);
  const activityId =
    type === NewsType.Activity ? _.sample(data.activityIds) ?? null : null;
  const isPublished = faker.datatype.boolean();
  const createdAt = faker.date.past();
  const views = isPublished ? faker.number.int({ min: 0, max: 300 }) : 0;
  const publishedAt = createdAt;

  return {
    id: getNextNewsId(),
    type: type,
    title: data.template?.title ?? faker.lorem.lines(1),
    content:
      data.template?.description ??
      faker.lorem.paragraphs({
        min: 3,
        max: 10,
      }),
    contentFormat: NewsContentFormat.Plaintext,
    thumbnail: null,
    organizationId: data.orgId,
    views: views,
    popularity: calculateNewsPopularity({
      isPublished: isPublished,
      publishedAt: publishedAt,
      views: views,
    }),
    authorId: data.authorId,
    isPublished: isPublished,
    publishedAt: publishedAt,
    createdAt: createdAt,
    updatedAt: faker.date.between({
      from: createdAt,
      to: new Date(),
    }),
    activityId: activityId,
  };
};

class NewsTemplate {
  title: string;
  description: string;
}

const loadNews = (path: string) => {
  // Parse txt file
  // Return array of NewsTemplate
  const content = readFileSync(path, 'utf-8');
  const lines = content.split('\n');
  const newsTemplates: NewsTemplate[] = [];
  let currentNewsTemplate: NewsTemplate | null = null;
  lines.forEach((line) => {
    if (line.startsWith('Title: ')) {
      currentNewsTemplate = new NewsTemplate();
      // Remove the prefix
      const title = line.substring('Title: '.length);
      currentNewsTemplate.title = title;
      newsTemplates.push(currentNewsTemplate);
    } else if (line.startsWith('Description: ')) {
      if (currentNewsTemplate) {
        const description = line.substring('Description: '.length);
        currentNewsTemplate.description = description;
      }
    } else if (line.trim().length !== 0) {
      if (currentNewsTemplate) {
        currentNewsTemplate.description += `\n${line}`;
      }
    }
  });
  return newsTemplates;
};
