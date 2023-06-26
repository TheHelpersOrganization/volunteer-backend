import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Role } from 'src/auth/constants';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import { ReportType } from '../constants';
import {
  GetReportQueryDto,
  GetReportQueryInclude,
  GetReportQuerySort,
} from '../dtos';
import { ReportOutputDto } from '../dtos/report.output.dto';

@Injectable()
export class ReportService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prismaService: PrismaService,
    private readonly profileService: ProfileService,
  ) {
    super(logger);
  }

  async getReports(context: RequestContext, query: GetReportQueryDto) {
    this.logCaller(context, this.getReports);
    const where = this.getReportWhereInput(context, query);
    const sort = this.getReportSortInput(query);
    const reports: any[] = await this.prismaService.report.findMany({
      where: where,
      orderBy: sort,
      include: this.getReportInclude(query.include),
    });
    const groupedByTypes: { [key: string]: any[] } = reports.reduce(
      (acc, report) => {
        if (!acc[report.type]) {
          acc[report.type] = [];
        }
        acc[report.type].push(report);
        return acc;
      },
      {},
    );
    // Side effect on reports
    for (const type in groupedByTypes) {
      const reports = groupedByTypes[type];
      const ids = reports.map((report) => report.id);
      if (type === ReportType.Account) {
        const reportedAccounts =
          await this.prismaService.reportAccount.findMany({
            where: {
              id: {
                in: ids,
              },
            },
          });
        const profiles = await this.profileService.getProfiles(context, {
          ids: reportedAccounts.map((account) => account.reportedAccountId),
          select: getProfileBasicSelect,
        });
        reports.forEach((report) => {
          report.reportedAccount = profiles.find(
            (profile) =>
              profile.id ===
              reportedAccounts.find((account) => account.id === report.id)
                ?.reportedAccountId,
          );
        });
      } else if (type == ReportType.Organization) {
        const reportedOrganizations =
          await this.prismaService.reportOrganization.findMany({
            where: {
              id: {
                in: ids,
              },
            },
            include: {
              reportedOrganization: true,
            },
          });
        reports.forEach((report) => {
          report.reportedOrganization = reportedOrganizations.find(
            (reportOrganization) => reportOrganization.id === report.id,
          )?.reportedOrganization;
        });
      } else if (type == ReportType.Activity) {
        const reportedActivities =
          await this.prismaService.reportActivity.findMany({
            where: {
              id: {
                in: ids,
              },
            },
            include: {
              reportedActivity: true,
            },
          });
        reports.forEach((report) => {
          report.reportedActivity = reportedActivities.find(
            (reportActivity) => reportActivity.id === report.id,
          )?.reportedActivity;
        });
      }
    }
    if (query.include?.includes(GetReportQueryInclude.Reporter)) {
      const reporterProfiles = await this.profileService.getProfiles(context, {
        ids: reports
          .map((report) => report.reporterId)
          .filter((v) => v != null),
        select: getProfileBasicSelect,
      });
      reports.forEach((report) => {
        report.reporter = reporterProfiles.find(
          (profile) => profile.id === report.reporterId,
        );
      });
    }
    if (query.include?.includes(GetReportQueryInclude.Reviewer)) {
      const reviewerProfiles = await this.profileService.getProfiles(context, {
        ids: reports
          .map((report) => report.reviewerId)
          .filter((v) => v != null),
        select: getProfileBasicSelect,
      });
      reports.forEach((report) => {
        report.reviewer = reviewerProfiles.find(
          (profile) => profile.id === report.reviewerId,
        );
      });
    }
    console.log(reports.find((report) => report.type == ReportType.Account));
    return reports.map((report) => this.mapToDto(report));
  }

  async getReportById(
    context: RequestContext,
    id: number,
    query: GetReportQueryDto,
  ) {
    this.logCaller(context, this.getReportById);
    const report: any = await this.prismaService.report.findUnique({
      where: {
        id: id,
        reporterId: context.isAdmin ? undefined : context.account.id,
      },
      include: this.getReportInclude(query.include),
    });
    if (report == null) {
      return null;
    }
    const type = report.type;
    if (type === ReportType.Account) {
      const reportedAccount = await this.prismaService.reportAccount.findUnique(
        {
          where: {
            id: id,
          },
          include: {
            reportedAccount: {
              include: {
                profile: true,
              },
            },
          },
        },
      );

      report.reportedAccount = reportedAccount?.reportedAccount.profile;
    } else if (type == ReportType.Organization) {
      const reportedOrganization =
        await this.prismaService.reportOrganization.findUnique({
          where: {
            id: id,
          },
          include: {
            reportedOrganization: true,
          },
        });
      report.reportedOrganization = reportedOrganization?.reportedOrganization;
    } else if (type == ReportType.Activity) {
      const reportedActivity =
        await this.prismaService.reportActivity.findUnique({
          where: {
            id: id,
          },
          include: {
            reportedActivity: true,
          },
        });
      report.reportedActivity = reportedActivity?.reportedActivity;
    }
    if (query.include?.includes(GetReportQueryInclude.Reporter)) {
      const reporterProfile = await this.profileService.getProfile(
        context,
        report.reporterId,
        {
          select: getProfileBasicSelect,
        },
      );
      report.reporter = reporterProfile;
    }
    if (query.include?.includes(GetReportQueryInclude.Reviewer)) {
      const reviewerProfile = await this.profileService.getProfile(
        context,
        report.reviewerId,
        {
          select: getProfileBasicSelect,
        },
      );
      report.reviewer = reviewerProfile;
    }
    return this.mapToDto(report);
  }

  getReportWhereInput(context: RequestContext, query: GetReportQueryDto) {
    const where: Prisma.ReportWhereInput = {};
    if (query.id) {
      where.id = {
        in: query.id,
      };
    }
    if (query.reporterId) {
      where.reporterId = query.reporterId;
    }
    if (query.mine || !context.account.roles.includes(Role.Admin)) {
      where.reporterId = context.account.id;
    }
    if (query.name) {
      where.title = {
        contains: query.name,
        mode: 'insensitive',
      };
    }
    if (query.type) {
      where.type = {
        in: query.type,
      };
    }
    if (query.status) {
      where.status = {
        in: query.status,
      };
    }
    if (Object.keys(where).length === 0) {
      return undefined;
    }
    return where;
  }

  getReportSortInput(query: GetReportQueryDto) {
    const sort: Prisma.ReportOrderByWithAggregationInput = {};
    if (query.sort) {
      if (query.sort === GetReportQuerySort.createdAtAsc) {
        sort.createdAt = 'asc';
      } else if (query.sort === GetReportQuerySort.createdAtDesc) {
        sort.createdAt = 'desc';
      }
      if (query.sort === GetReportQuerySort.updatedAtAsc) {
        sort.updatedAt = 'asc';
      } else if (query.sort === GetReportQuerySort.updatedAtDesc) {
        sort.updatedAt = 'desc';
      }
    }
    if (Object.keys(sort).length === 0) {
      return undefined;
    }
    return sort;
  }

  getReportInclude(include?: GetReportQueryInclude[]) {
    if (include == null || include.length === 0) {
      return undefined;
    }
    const res: Prisma.ReportInclude = {};
    if (include.includes(GetReportQueryInclude.File)) {
      res.reportFile = {
        include: {
          file: true,
        },
      };
    }
    if (Object.keys(res).length === 0) {
      return undefined;
    }
    return res;
  }

  mapToDto(raw: any) {
    return this.output(ReportOutputDto, {
      ...raw,
      files: raw.reportFile?.map((reportFile) => reportFile.file),
    });
  }
}
