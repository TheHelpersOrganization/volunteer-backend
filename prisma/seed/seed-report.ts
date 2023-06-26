import { faker } from '@faker-js/faker';
import {
  Account,
  Activity,
  Organization,
  PrismaClient,
  Report,
  ReportAccount,
  ReportActivity,
  ReportFile,
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

  const reportFilesCount: { [key: number]: number } = {};
  const reportFiles: ReportFile[] = [];

  accounts.forEach((account) => {
    reportStatuses.forEach((status) => {
      const numberOfAccountReports = faker.number.int({ min: 0, max: 1 });
      for (let i = 0; i < numberOfAccountReports; i++) {
        const report = createReport({
          type: ReportType.Account,
          status: status,
          reporterId: account.id,
          reportHandlerId: faker.helpers.arrayElement(adminAccounts).id,
        });
        reports.push(report);

        accountReports.push({
          id: report.id,
          reportedAccountId: faker.helpers.arrayElement(volunteerAccounts).id,
        });

        reportFilesCount[report.id] = faker.number.int({ min: 0, max: 2 });
      }
      const numberOfOrganizationReports = faker.number.int({ min: 0, max: 1 });
      for (let i = 0; i < numberOfOrganizationReports; i++) {
        const report = createReport({
          type: ReportType.Organization,
          status: status,
          reporterId: account.id,
          reportHandlerId: faker.helpers.arrayElement(adminAccounts).id,
        });
        reports.push(report);

        organizationReports.push({
          id: report.id,
          reportedOrganizationId: faker.helpers.arrayElement(organizations).id,
        });

        reportFilesCount[report.id] = faker.number.int({ min: 0, max: 2 });
      }
      const numberOfActivityReports = faker.number.int({ min: 0, max: 1 });
      for (let i = 0; i < numberOfActivityReports; i++) {
        const report = createReport({
          type: ReportType.Activity,
          status: status,
          reporterId: account.id,
          reportHandlerId: faker.helpers.arrayElement(adminAccounts).id,
        });
        reports.push(report);

        activityReports.push({
          id: report.id,
          reportedActivityId: faker.helpers.arrayElement(activities).id,
        });

        reportFilesCount[report.id] = faker.number.int({ min: 0, max: 2 });
      }
    });
  });

  const files = await seedFiles(
    prisma,
    './tmp/images/report-file',
    Object.values(reportFilesCount).reduce((a, b) => a + b, 0),
    () =>
      faker.image.urlLoremFlickr({
        width: 128,
        height: 128,
      }),
  );

  let fileIndex = 0;
  for (const reportId in reportFilesCount) {
    const numberOfReportFiles = reportFilesCount[reportId];
    for (let i = 0; i < numberOfReportFiles; i++) {
      const file = files[fileIndex];
      if (file == null) {
        fileIndex++;
        continue;
      }
      reportFiles.push({
        reportId: parseInt(reportId),
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

  await prisma.reportFile.createMany({
    data: reportFiles,
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
  reportHandlerId: number;
}) => {
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
    content: faker.lorem.paragraph(),
    reporterId: data.reporterId,
    reportHandlerId: data.reportHandlerId,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
};
