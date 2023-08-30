import { AccountService } from '@app/account/services';
import { ActivityNotFoundException } from '@app/activity/exceptions';
import { Role } from '@app/auth/constants';
import { AccountNotFoundException } from '@app/auth/exceptions';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { countGroupByTime } from '@app/common/utils';
import { NewsNotFoundException } from '@app/news/exceptions';
import { OrganizationNotFoundException } from '@app/organization/exceptions';
import { PrismaService } from '@app/prisma';
import { getProfileBasicSelect } from '@app/profile/dtos';
import { ProfileService } from '@app/profile/services';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReportStatus, ReportType } from '../constants';
import {
  BaseGetReportQueryDto,
  CountReportQueryDto,
  CreateReportInputDto,
  CreateReportMessageInputDto,
  GetReportQueryDto,
  GetReportQueryInclude,
  GetReportQuerySort,
} from '../dtos';
import {
  ReportMessageOutputDto,
  ReportOutputDto,
} from '../dtos/report.output.dto';
import {
  ReportAccountMustNotBeNullException,
  ReportActivityMustNotBeNullException,
  ReportCanNotBeCancelledException,
  ReportIsInReviewingException,
  ReportIsNotInReviewingException,
  ReportNotFoundException,
  ReportOrganizationMustNotBeNullException,
} from '../exceptions';

@Injectable()
export class ReportService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prismaService: PrismaService,
    private readonly accountService: AccountService,
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
      const senderIds: number[] = [];
      reports.forEach((report) => {
        if (report.reportMessage == null) {
          return;
        }
        report.reportMessage.forEach((rm) => {
          if (rm.senderId != null) {
            senderIds.push(rm.senderId);
          }
        });
      });
      const senders = await this.profileService.getProfiles(context, {
        ids: senderIds,
        select: getProfileBasicSelect,
      });
      reports.forEach((report) => {
        if (report.reportMessage == null) {
          return;
        }
        report.reportMessage.forEach((rm) => {
          rm.sender = senders.find((sender) => sender.id === rm.senderId);
        });
      });
    }
    return Promise.all(
      reports.map((report) => this.mapReportToDto(context, report)),
    );
  }

  async countReports(context: RequestContext, query: CountReportQueryDto) {
    const conditions: Prisma.Sql[] = [];
    if (query.type != null) {
      const subConditions: Prisma.Sql[] = [];
      query.type.forEach((type) => {
        subConditions.push(Prisma.sql`"type" = ${type}`);
      });
      conditions.push(Prisma.sql`(${Prisma.join(subConditions, ' OR ')})`);
    }
    if (query.status != null) {
      const statusConditions: Prisma.Sql[] = [];
      query.status.forEach((status) => {
        statusConditions.push(Prisma.sql`"status" = ${status}`);
      });
      conditions.push(Prisma.sql`(${Prisma.join(statusConditions, ' OR ')})`);
    }
    if (query.startTime != null) {
      conditions.push(Prisma.sql`"createdAt" >= ${query.startTime}`);
    }
    if (query.endTime != null) {
      conditions.push(Prisma.sql`"createdAt" <= ${query.endTime}`);
    }
    const sqlWhere =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;
    const res: {
      month: Date;
      count: bigint;
    }[] = await this.prismaService.$queryRaw`
      SELECT
      DATE_TRUNC('month', "createdAt")
        AS month,
      COUNT(*) AS count
      FROM "Report"
      ${sqlWhere}
      GROUP BY DATE_TRUNC('month',"createdAt");
    `;

    return countGroupByTime(res);
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
    if (
      query.include?.includes(GetReportQueryInclude.Message) &&
      report.reportMessage != null
    ) {
      const senders = await this.profileService.getProfiles(context, {
        ids: report.reportMessage.map((rm) => rm.senderId),
        select: getProfileBasicSelect,
      });
      report.reportMessage.forEach((rm) => {
        rm.sender = senders.find((sender) => sender.id === rm.senderId);
      });
    }
    return this.mapReportToDto(context, report);
  }

  async createReport(context: RequestContext, dto: CreateReportInputDto) {
    this.logCaller(context, this.createReport);
    // this.validateReportMessage(context, context.account.id, [dto.message]);
    if (dto.type === ReportType.Account) {
      if (dto.reportedAccountId == null) {
        throw new ReportAccountMustNotBeNullException();
      }
      const account = await this.prismaService.account.findUnique({
        where: {
          id: dto.reportedAccountId,
        },
      });
      if (account == null) {
        throw new AccountNotFoundException();
      }
      const existing = await this.prismaService.report.findFirst({
        where: {
          reporterId: context.account.id,
          reportAccount: {
            reportedAccountId: dto.reportedAccountId,
          },
          status: {
            in: [ReportStatus.Reviewing, ReportStatus.Pending],
          },
        },
      });
      if (existing != null) {
        throw new ReportIsInReviewingException();
      }
    }
    if (dto.type === ReportType.Organization) {
      if (dto.reportedOrganizationId == null) {
        throw new ReportOrganizationMustNotBeNullException();
      }
      const organization = await this.prismaService.organization.findUnique({
        where: {
          id: dto.reportedOrganizationId,
        },
      });
      if (organization == null) {
        throw new OrganizationNotFoundException();
      }
      const existing = await this.prismaService.report.findFirst({
        where: {
          reporterId: context.account.id,
          reportOrganization: {
            reportedOrganizationId: dto.reportedOrganizationId,
          },
          status: {
            in: [ReportStatus.Reviewing, ReportStatus.Pending],
          },
        },
      });
      if (existing != null) {
        throw new ReportIsInReviewingException();
      }
    }
    if (dto.type === ReportType.Activity) {
      if (dto.reportedActivityId == null) {
        throw new ReportActivityMustNotBeNullException();
      }
      const activity = await this.prismaService.activity.findUnique({
        where: {
          id: dto.reportedActivityId,
        },
      });
      if (activity == null) {
        throw new ActivityNotFoundException();
      }
      const existing = await this.prismaService.report.findFirst({
        where: {
          reporterId: context.account.id,
          reportActivity: {
            reportedActivityId: dto.reportedActivityId,
          },
          status: {
            in: [ReportStatus.Reviewing, ReportStatus.Pending],
          },
        },
      });
      if (existing != null) {
        throw new ReportIsInReviewingException();
      }
    }
    if (dto.type === ReportType.News) {
      if (dto.reportedNewsId == null) {
        throw new ReportActivityMustNotBeNullException();
      }
      const news = await this.prismaService.news.findUnique({
        where: {
          id: dto.reportedNewsId,
        },
      });
      if (news == null) {
        throw new NewsNotFoundException();
      }
      const existing = await this.prismaService.report.findFirst({
        where: {
          reporterId: context.account.id,
          reportNews: {
            reportedNewsId: dto.reportedNewsId,
          },
          status: {
            in: [ReportStatus.Reviewing, ReportStatus.Pending],
          },
        },
      });
      if (existing != null) {
        throw new ReportIsInReviewingException();
      }
    }
    const report = await this.prismaService.report.create({
      data: {
        title: dto.title,
        type: dto.type,
        reporterId: context.account.id,
        reportMessage: {
          create: {
            content: dto.message.content,
            senderId: context.account.id,
            first: true,
            file:
              dto.message.fileIds == null
                ? undefined
                : {
                    createMany: {
                      data: dto.message.fileIds.map((fileId) => ({
                        fileId: fileId,
                      })),
                    },
                  },
          },
        },
        reportAccount:
          dto.reportedAccountId == null
            ? undefined
            : {
                create: {
                  reportedAccountId: dto.reportedAccountId,
                },
              },
        reportOrganization:
          dto.reportedOrganizationId == null
            ? undefined
            : {
                create: {
                  reportedOrganizationId: dto.reportedOrganizationId,
                },
              },
        reportActivity:
          dto.reportedActivityId == null
            ? undefined
            : {
                create: {
                  reportedActivityId: dto.reportedActivityId,
                },
              },
        reportNews:
          dto.reportedNewsId == null
            ? undefined
            : {
                create: {
                  reportedNewsId: dto.reportedNewsId,
                },
              },
      },
    });
    return this.getReportById(context, report.id, {});
  }

  async createReportMessage(
    context: RequestContext,
    reportId: number,
    dto: CreateReportMessageInputDto,
  ) {
    this.logCaller(context, this.createReport);
    const senderId = context.account.id;
    const report = await this.prismaService.report.findUnique({
      where: {
        id: reportId,
        reporterId: context.isAdmin ? undefined : senderId,
        status: {
          in: [ReportStatus.Pending, ReportStatus.Reviewing],
        },
      },
    });
    if (report == null) {
      throw new ReportNotFoundException();
    }
    this.validateReportMessage(context, reportId, [senderId]);
    const reportMessage = await this.prismaService.$transaction(async (tx) => {
      const reportMessage = await tx.reportMessage.create({
        data: {
          reportId: reportId,
          senderId: senderId,
          content: dto.content,
          file:
            dto.fileIds == null
              ? undefined
              : {
                  createMany: {
                    data: dto.fileIds.map((fileId) => ({
                      fileId: fileId,
                    })),
                  },
                },
        },
        include: {
          file: {
            include: {
              file: true,
            },
          },
        },
      });
      if (report.status === ReportStatus.Pending && context.isAdmin) {
        await tx.report.update({
          where: {
            id: reportId,
          },
          data: {
            status: ReportStatus.Reviewing,
          },
        });
      }
      return reportMessage;
    });

    return this.mapReportMessageToDto(reportMessage);
  }

  async validateReportMessage(
    context: RequestContext,
    reporterId: number,
    senderIds: number[],
  ) {
    // Remove our own id
    const ids = senderIds.filter((v) => v !== reporterId);
    if (senderIds.length > 0) {
      const senders = await this.accountService.getAccounts(context, ids);
      if (senders.some((sender) => !sender.roles.includes(Role.Admin))) {
        throw new ForbiddenException('Invalid sender');
      }
    }
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
    } else if (query.reporterId) {
      where.reporterId = query.reporterId;
    }
    if (query.isReviewer && context.account.roles.includes(Role.Admin)) {
      where.reporterId = {
        not: context.account.id,
      };
      where.reportMessage = {
        some: {
          senderId: context.account.id,
        },
      };
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
      reportNews: {
        include: {
          reportedNews: true,
        },
      },
    };
    if (include?.includes(GetReportQueryInclude.Message)) {
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

  // Owner only
  async cancelReport(context: RequestContext, id: number) {
    this.logCaller(context, this.cancelReport);
    const report = await this.prismaService.report.findUnique({
      where: {
        id: id,
        reporterId: context.account.id,
      },
    });

    if (report == null) {
      throw new ReportNotFoundException();
    }
    if (
      report.status !== ReportStatus.Pending &&
      report.status !== ReportStatus.Reviewing
    ) {
      throw new ReportCanNotBeCancelledException();
    }
    await this.prismaService.report.update({
      where: {
        id: id,
      },
      data: {
        status: ReportStatus.Cancelled,
      },
    });
    return this.getReportById(context, id, {});
  }

  // Admin only
  async completeReport(context: RequestContext, id: number) {
    this.logCaller(context, this.completeReport);
    const report = await this.prismaService.report.findUnique({
      where: {
        id: id,
      },
    });
    if (report == null) {
      throw new ReportNotFoundException();
    }
    if (report.status !== ReportStatus.Reviewing) {
      throw new ReportIsNotInReviewingException();
    }
    await this.prismaService.report.update({
      where: {
        id: id,
      },
      data: {
        status: ReportStatus.Completed,
      },
    });
    return this.getReportById(context, id, {});
  }

  // Admin only
  async rejectReport(context: RequestContext, id: number) {
    this.logCaller(context, this.rejectReport);
    const report = await this.prismaService.report.findUnique({
      where: {
        id: id,
      },
    });
    if (report == null) {
      throw new ReportNotFoundException();
    }
    if (report.status !== ReportStatus.Reviewing) {
      throw new ReportIsNotInReviewingException();
    }
    await this.prismaService.report.update({
      where: {
        id: id,
      },
      data: {
        status: ReportStatus.Rejected,
      },
    });
    return this.getReportById(context, id, {});
  }

  async mapReportToDto(context: RequestContext, raw: any) {
    if (raw.type === ReportType.Account) {
      raw.reportedAccount = await this.profileService.getProfile(
        context,
        raw.reportAccount.reportedAccountId,
        {
          select: getProfileBasicSelect,
        },
      );
    }
    const output: ReportOutputDto = {
      ...raw,
      messages: raw.reportMessage?.map((rm) => this.mapReportMessageToDto(rm)),
      reportedAccount: raw.reportedAccount,
      reportedOrganization: raw.reportOrganization?.reportedOrganization,
      reportedActivity: raw.reportActivity?.reportedActivity,
      reportedNews: raw.reportNews?.reportedNews,
    };
    return this.output(ReportOutputDto, output);
  }

  mapReportMessageToDto(raw: any) {
    const output: ReportMessageOutputDto = {
      ...raw,
      files: raw.file?.map((f) => f.file),
    };
    return this.output(ReportMessageOutputDto, output);
  }
}
