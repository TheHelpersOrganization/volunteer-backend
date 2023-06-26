import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Role } from 'src/auth/constants';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ReportType } from '../constants';
import { GetReportQueryDto, GetReportQuerySort } from '../dtos';
import { ReportOutputDto } from '../dtos/report.output.dto';

@Injectable()
export class ReportService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prismaService: PrismaService,
  ) {
    super(logger);
  }

  async getReports(context: RequestContext, query: GetReportQueryDto) {
    this.logCaller(context, this.getReports);
    const where = this.getReportWhereInput(context, query);
    const sort = this.getReportSortInput(query);
    const reports = await this.prismaService.report.findMany({
      where: where,
      orderBy: sort,
      include: this.getReportInclude(),
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
            include: {
              reportedAccount: {
                include: {
                  profile: true,
                },
              },
            },
          });

        reports.forEach((report) => {
          report.reportedAccount = reportedAccounts.find(
            (reportAccount) => reportAccount.id === report.id,
          )?.reportedAccount.profile;
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
          report.reportActivity = reportedActivities.find(
            (reportActivity) => reportActivity.id === report.id,
          )?.reportedActivity;
        });
      }
    }

    return reports.map((report) => this.mapToDto(report));
  }

  async getReportById(context: RequestContext, id: number) {
    this.logCaller(context, this.getReportById);
    const report: any = await this.prismaService.report.findUnique({
      where: {
        id: id,
        reporterId: context.isAdmin ? undefined : context.account.id,
      },
      include: this.getReportInclude(),
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

  getReportInclude() {
    const include: Prisma.ReportInclude = {
      reportFile: {
        include: {
          file: true,
        },
      },
    };
    return include;
  }

  mapToDto(raw: any) {
    return this.output(ReportOutputDto, {
      ...raw,
      files: raw.reportFile?.map((reportFile) => reportFile.file),
    });
  }
}
