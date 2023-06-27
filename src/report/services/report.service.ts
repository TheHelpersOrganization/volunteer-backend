import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { requireNonNullish } from 'prisma/seed/utils';
import { Role } from 'src/auth/constants';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import {
  BaseGetReportQueryDto,
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
    console.log(reports[0]);

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
    if (query.include?.includes(GetReportQueryInclude.Message)) {
      const senders = await this.profileService.getProfiles(context, {
        ids: reports.flatMap((report) =>
          requireNonNullish(report.reportMessage).map((rm) => rm.senderId),
        ),
        select: getProfileBasicSelect,
      });
      reports.forEach((report) => {
        requireNonNullish(report.reportMessage).forEach((rm) => {
          rm.sender = senders.find((sender) => sender.id === rm.senderId);
        });
      });
    }
    return reports.map((report) => this.mapToDto(report));
  }

  async getReportById(
    context: RequestContext,
    id: number,
    query: BaseGetReportQueryDto,
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
    const res: Prisma.ReportInclude = {
      reportAccount: true,
      reportOrganization: {
        include: {
          reportedOrganization: true,
        },
      },
      reportActivity: {
        include: {
          reportedActivity: true,
        },
      },
    };
    if (include.includes(GetReportQueryInclude.Message)) {
      res.reportMessage = {
        include: {
          file: {
            include: {
              file: true,
            },
          },
        },
      };
    }
    if (Object.keys(res).length === 0) {
      return undefined;
    }
    return res;
  }

  mapToDto(raw: any) {
    const output: ReportOutputDto = {
      ...raw,
      messages: raw.reportMessage?.map((rm) => ({
        ...rm,
        files: rm.file.map((f) => f.file),
      })),
      reportedAccount: raw.reportedAccount?.profile,
      reportedOrganization: raw.reportedOrganization,
      reportedActivity: raw.reportedActivity,
    };
    return this.output(ReportOutputDto, output);
  }
}
