import { OrganizationStatus } from '@app/organization/constants';
import {
  ReportStatus,
  ReportType,
  reportStatuses,
  reportTypes,
} from '@app/report/constants';
import { faker } from '@faker-js/faker';
import {
  Account,
  Activity,
  News,
  Organization,
  PrismaClient,
  Report,
  ReportAccount,
  ReportActivity,
  ReportMessage,
  ReportMessageFile,
  ReportNews,
  ReportOrganization,
} from '@prisma/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { seedFiles } from './seed-file';
import { getNextReportId } from './utils';

export const seedReports = async (
  prisma: PrismaClient,
  volunteerAccounts: Account[],
  adminAccounts: Account[],
  accounts: Account[],
  organizations: Organization[],
  activities: Activity[],
  news: News[],
  options?: {
    importantAccountIds?: number[];
    runWithoutDb?: boolean;
  },
) => {
  const verifiedOrganizations = organizations.filter(
    (organization) => organization.status == OrganizationStatus.Verified,
  );
  const reports: (Report & { template?: ReportTemplate })[] = [];
  const accountReports: ReportAccount[] = [];
  const organizationReports: ReportOrganization[] = [];
  const activityReports: ReportActivity[] = [];
  const newsReports: ReportNews[] = [];

  const reportMessages: ReportMessage[] = [];
  const reportMessageFilesCount: { [key: number]: number } = {};
  const reportMessageFiles: ReportMessageFile[] = [];

  const accountTemplates = loadReports('./assets/account-reports.txt');
  const organizationTemplates = loadReports(
    './assets/organization-reports.txt',
  );
  const activityTemplates = loadReports('./assets/activity-reports.txt');
  const newsTemplates = loadReports('./assets/news-reports.txt');

  accounts.forEach((account) => {
    if (!options?.importantAccountIds?.includes(account.id)) {
      const numberOfReports = faker.helpers.weightedArrayElement([
        { weight: 30, value: 0 },
        { weight: 10, value: 1 },
        { weight: 1, value: 2 },
      ]);
      for (let i = 0; i < numberOfReports; i++) {
        const report = createReport({
          type: faker.helpers.arrayElement(reportTypes),
          status: faker.helpers.arrayElement(reportStatuses),
          reporterId: account.id,
          reviewerId: faker.helpers.arrayElement(adminAccounts).id,
          accountTemplates: accountTemplates,
          organizationTemplates: organizationTemplates,
          activityTemplates: activityTemplates,
          newsTemplates: newsTemplates,
        });
        reports.push(report);

        if (report.type === ReportType.Account) {
          accountReports.push({
            id: report.id,
            reportedAccountId: faker.helpers.arrayElement(volunteerAccounts).id,
          });
        } else if (report.type === ReportType.Organization) {
          organizationReports.push({
            id: report.id,
            reportedOrganizationId: faker.helpers.arrayElement(
              verifiedOrganizations,
            ).id,
          });
        } else if (report.type === ReportType.Activity) {
          activityReports.push({
            id: report.id,
            reportedActivityId: faker.helpers.arrayElement(activities).id,
          });
        } else if (report.type === ReportType.News) {
          newsReports.push({
            id: report.id,
            reportedNewsId: faker.helpers.arrayElement(news).id,
          });
        }
      }
    } else {
      reportStatuses.forEach((status) => {
        const numberOfAccountReports = faker.helpers.weightedArrayElement([
          { weight: 10, value: 0 },
          { weight: 5, value: 1 },
          { weight: 1, value: 1 },
        ]);
        for (let i = 0; i < numberOfAccountReports; i++) {
          const report = createReport({
            type: ReportType.Account,
            status: status,
            reporterId: account.id,
            reviewerId: faker.helpers.arrayElement(adminAccounts).id,
            accountTemplates: accountTemplates,
            organizationTemplates: organizationTemplates,
            activityTemplates: activityTemplates,
            newsTemplates: newsTemplates,
          });
          reports.push(report);

          accountReports.push({
            id: report.id,
            reportedAccountId: faker.helpers.arrayElement(volunteerAccounts).id,
          });
        }
        const numberOfOrganizationReports = faker.helpers.weightedArrayElement([
          { weight: account.id, value: 0 },
          { weight: 1, value: 1 },
        ]);
        for (let i = 0; i < numberOfOrganizationReports; i++) {
          const report = createReport({
            type: ReportType.Organization,
            status: status,
            reporterId: account.id,
            reviewerId: faker.helpers.arrayElement(adminAccounts).id,
            accountTemplates: accountTemplates,
            organizationTemplates: organizationTemplates,
            activityTemplates: activityTemplates,
            newsTemplates: newsTemplates,
          });
          reports.push(report);

          organizationReports.push({
            id: report.id,
            reportedOrganizationId: faker.helpers.arrayElement(
              verifiedOrganizations,
            ).id,
          });
        }
        const numberOfActivityReports = faker.helpers.weightedArrayElement([
          { weight: account.id, value: 0 },
          { weight: 1, value: 1 },
        ]);
        for (let i = 0; i < numberOfActivityReports; i++) {
          const report = createReport({
            type: ReportType.Activity,
            status: status,
            reporterId: account.id,
            reviewerId: faker.helpers.arrayElement(adminAccounts).id,
            accountTemplates: accountTemplates,
            organizationTemplates: organizationTemplates,
            activityTemplates: activityTemplates,
            newsTemplates: newsTemplates,
          });
          reports.push(report);

          activityReports.push({
            id: report.id,
            reportedActivityId: faker.helpers.arrayElement(activities).id,
          });
        }
        const numberOfNewsReports = faker.helpers.weightedArrayElement([
          { weight: account.id, value: 0 },
          { weight: 1, value: 1 },
        ]);
        for (let i = 0; i < numberOfNewsReports; i++) {
          const report = createReport({
            type: ReportType.News,
            status: status,
            reporterId: account.id,
            reviewerId: faker.helpers.arrayElement(adminAccounts).id,
            accountTemplates: accountTemplates,
            organizationTemplates: organizationTemplates,
            activityTemplates: activityTemplates,
            newsTemplates: newsTemplates,
          });
          reports.push(report);

          newsReports.push({
            id: report.id,
            reportedNewsId: faker.helpers.arrayElement(news).id,
          });
        }
      });
    }
  });
  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const reportMessage = createReportMessage({
      reportId: report.id,
      senderId: faker.helpers.arrayElement(adminAccounts).id,
      reportCreatedAt: report.createdAt,
      reportUpdatedAt: report.updatedAt,
      first: true,
      template: report.template!,
      index: 0,
    });
    reportMessages.push(reportMessage);

    if (options?.importantAccountIds?.includes(report.reporterId)) {
      reportMessageFilesCount[reportMessage.id] =
        faker.helpers.weightedArrayElement([
          {
            weight: 100,
            value: 0,
          },
          {
            weight: 5,
            value: 1,
          },
          {
            weight: 1,
            value: 2,
          },
        ]);
    } else {
      reportMessageFilesCount[reportMessage.id] =
        faker.helpers.weightedArrayElement([
          {
            weight: 20,
            value: 0,
          },
          {
            weight: 5,
            value: 1,
          },
          {
            weight: 1,
            value: 2,
          },
        ]);
    }

    const numberOfReportMessages = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < numberOfReportMessages; i++) {
      const otherReportMessage = createReportMessage({
        reportId: report.id,
        senderId: faker.helpers.arrayElement([
          report.reporterId,
          reportMessage.senderId,
        ]),
        reportCreatedAt: report.createdAt,
        reportUpdatedAt: report.updatedAt,
        template: report.template!,
        index: i + 1,
      });
      reportMessages.push(otherReportMessage);

      if (options?.importantAccountIds?.includes(report.reporterId)) {
        reportMessageFilesCount[otherReportMessage.id] =
          faker.helpers.weightedArrayElement([
            {
              weight: 100,
              value: 0,
            },
            {
              weight: 1,
              value: 1,
            },
          ]);
        continue;
      } else {
        reportMessageFilesCount[otherReportMessage.id] =
          faker.helpers.weightedArrayElement([
            {
              weight: 50,
              value: 0,
            },
            {
              weight: 1,
              value: 1,
            },
          ]);
      }
    }
  }

  const files = await seedFiles(
    prisma,
    './tmp/images/report-file',
    Object.values(reportMessageFilesCount).reduce((a, b) => a + b, 0),
    () =>
      faker.image.urlLoremFlickr({
        width: 128,
        height: 128,
      }),
    {
      skipInsertIntoDatabase: options?.runWithoutDb,
    },
  );

  let fileIndex = 0;
  for (const reportMessageId in reportMessageFilesCount) {
    const numberOfReportFiles = reportMessageFilesCount[reportMessageId];
    for (let i = 0; i < numberOfReportFiles; i++) {
      const file = files[fileIndex];
      if (file == null) {
        fileIndex++;
        continue;
      }
      reportMessageFiles.push({
        reportMessageId: parseInt(reportMessageId),
        fileId: file.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      fileIndex++;
    }
  }

  if (options?.runWithoutDb) {
    return {
      reports: reports,
      accountReports: accountReports,
      organizationReports: organizationReports,
      activityReports: activityReports,
      newsReports: newsReports,
    };
  }

  reports.forEach((report) => {
    delete report.template;
  });
  await prisma.report.createMany({
    data: reports,
  });

  await prisma.reportAccount.createMany({
    data: accountReports,
  });

  await prisma.reportOrganization.createMany({
    data: organizationReports,
  });

  await prisma.reportActivity.createMany({
    data: activityReports,
  });

  await prisma.reportNews.createMany({
    data: newsReports,
  });

  await prisma.reportMessage.createMany({
    data: reportMessages,
  });

  await prisma.reportMessageFile.createMany({
    data: reportMessageFiles,
  });

  return {
    reports: reports,
    accountReports: accountReports,
    organizationReports: organizationReports,
    activityReports: activityReports,
    newsReports: newsReports,
  };
};

const createReport = (data: {
  type: ReportType;
  status: ReportStatus;
  reporterId: number;
  reviewerId: number;
  accountTemplates: ReportTemplate[];
  organizationTemplates: ReportTemplate[];
  activityTemplates: ReportTemplate[];
  newsTemplates: ReportTemplate[];
}) => {
  const createdAt = faker.date.past({ years: 1, refDate: new Date() });
  const updatedAt = faker.date.between({
    from: createdAt,
    to: new Date(),
  });

  let template: ReportTemplate;
  if (data.type === ReportType.Account) {
    template = faker.helpers.arrayElement(data.accountTemplates);
  } else if (data.type === ReportType.Organization) {
    template = faker.helpers.arrayElement(data.organizationTemplates);
  } else if (data.type === ReportType.Activity) {
    template = faker.helpers.arrayElement(data.activityTemplates);
  } else {
    template = faker.helpers.arrayElement(data.newsTemplates);
  }

  return {
    id: getNextReportId(),
    type: data.type,
    status: data.status,
    title: template.title,
    reporterId: data.reporterId,
    reviewerId: data.reviewerId,
    createdAt: createdAt,
    updatedAt: updatedAt,
    template: template,
  };
};

const createReportMessage = (data: {
  reportId: number;
  senderId: number;
  reportCreatedAt: Date;
  reportUpdatedAt: Date;
  first?: boolean;
  template: ReportTemplate;
  index: number;
}): ReportMessage => {
  const createdAt = faker.date.between({
    from: data.reportCreatedAt,
    to: data.reportUpdatedAt,
  });
  const updatedAt = faker.date.between({
    from: createdAt,
    to: data.reportUpdatedAt,
  });

  return {
    id: getNextReportId(),
    reportId: data.reportId,
    senderId: data.senderId,
    first: data.first ?? false,
    content: data.template.messages[data.index],
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
};

class ReportTemplate {
  title: string;
  messages: string[];
}

const loadReports = (relativePath: string) => {
  const content = readFileSync(path.join(__dirname, relativePath), 'utf-8');
  const lines = content.split('\n');
  const reports: ReportTemplate[] = [];
  let currentReport: ReportTemplate | null = null;

  for (const line of lines) {
    if (line.startsWith('Report')) {
      if (currentReport != null) {
        reports.push(currentReport);
      }
      currentReport = new ReportTemplate();
      currentReport.title = line.replace('Report:', '').trim();
      currentReport.messages = [];
    } else if (line.startsWith('User') || line.startsWith('Admin')) {
      if (currentReport != null) {
        if (currentReport.messages == null) {
          currentReport.messages = [];
        }
        currentReport.messages.push(
          line.replace('User:', '').replace('Admin:', '').trim(),
        );
      }
    }
  }

  return reports;
};
