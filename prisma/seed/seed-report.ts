import { faker } from '@faker-js/faker';
import {
  Account,
  Activity,
  Organization,
  PrismaClient,
  Report,
  ReportAccount,
  ReportActivity,
  ReportMessage,
  ReportMessageFile,
  ReportOrganization,
} from '@prisma/client';
import { ReportStatus, ReportType, reportStatuses } from 'src/report/constants';
import { seedFiles } from './seed-file';
import { getNextReportId } from './utils';

export const seedReports = async (
  prisma: PrismaClient,
  volunteerAccounts: Account[],
  adminAccounts: Account[],
  accounts: Account[],
  organizations: Organization[],
  activities: Activity[],
) => {
  const reports: Report[] = [];
  const accountReports: ReportAccount[] = [];
  const organizationReports: ReportOrganization[] = [];
  const activityReports: ReportActivity[] = [];

  const reportMessages: ReportMessage[] = [];
  const reportMessageFilesCount: { [key: number]: number } = {};
  const reportMessageFiles: ReportMessageFile[] = [];

  accounts.forEach((account) => {
    reportStatuses.forEach((status) => {
      const numberOfAccountReports = faker.number.int({ min: 0, max: 1 });
      for (let i = 0; i < numberOfAccountReports; i++) {
        const report = createReport({
          type: ReportType.Account,
          status: status,
          reporterId: account.id,
          reviewerId: faker.helpers.arrayElement(adminAccounts).id,
        });
        reports.push(report);

        accountReports.push({
          id: report.id,
          reportedAccountId: faker.helpers.arrayElement(volunteerAccounts).id,
        });
      }
      const numberOfOrganizationReports = faker.number.int({ min: 0, max: 1 });
      for (let i = 0; i < numberOfOrganizationReports; i++) {
        const report = createReport({
          type: ReportType.Organization,
          status: status,
          reporterId: account.id,
          reviewerId: faker.helpers.arrayElement(adminAccounts).id,
        });
        reports.push(report);

        organizationReports.push({
          id: report.id,
          reportedOrganizationId: faker.helpers.arrayElement(organizations).id,
        });
      }
      const numberOfActivityReports = faker.number.int({ min: 0, max: 1 });
      for (let i = 0; i < numberOfActivityReports; i++) {
        const report = createReport({
          type: ReportType.Activity,
          status: status,
          reporterId: account.id,
          reviewerId: faker.helpers.arrayElement(adminAccounts).id,
        });
        reports.push(report);

        activityReports.push({
          id: report.id,
          reportedActivityId: faker.helpers.arrayElement(activities).id,
        });
      }
    });
  });

  for (const report of reports) {
    const reportMessage = createReportMessage({
      reportId: report.id,
      senderId: faker.helpers.arrayElement(adminAccounts).id,
      reportCreatedAt: report.createdAt,
      reportUpdatedAt: report.updatedAt,
      first: true,
    });
    reportMessages.push(reportMessage);

    reportMessageFilesCount[reportMessage.id] = faker.number.int({
      min: 0,
      max: 2,
    });

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
      });
      reportMessages.push(otherReportMessage);

      reportMessageFilesCount[otherReportMessage.id] =
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
  };
};

const createReport = (data: {
  type: ReportType;
  status: ReportStatus;
  reporterId: number;
  reviewerId: number;
}): Report => {
  const createdAt = faker.date.past({ years: 1, refDate: new Date() });
  const updatedAt = faker.date.between({
    from: createdAt,
    to: new Date(),
  });

  return {
    id: getNextReportId(),
    type: data.type,
    status: data.status,
    title: faker.lorem.sentence(),
    reporterId: data.reporterId,
    reviewerId: data.reviewerId,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
};

const createReportMessage = (data: {
  reportId: number;
  senderId: number;
  reportCreatedAt: Date;
  reportUpdatedAt: Date;
  first?: boolean;
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
    content: faker.lorem.paragraph(),
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
};
