import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma';
import {
  CreateNotificationInputDto,
  DeleteNotificationsInputDto,
  GetNotificationByIdQueryDto,
  GetNotificationInclude,
  GetNotificationSort,
  GetNotificationsQueryDto,
  MarkNotificationsAsReadInputDto,
} from '../dtos';
import { NotificationOutputDto } from '../dtos/notification.output.dto';

@Injectable()
export class NotificationService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {
    super(logger);
  }

  async getNotifications(
    context: RequestContext,
    query: GetNotificationsQueryDto,
  ) {
    this.logCaller(context, this.getNotifications);
    const where = this.getNotificationWhere(context, query);
    const sort = this.getNotificationSort(query);
    const res = await this.prisma.notification.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
      orderBy: sort,
      include: this.getNotificationInclude(query),
    });
    return res.map((n) => this.mapToDto(n));
  }

  async countNotifications(
    context: RequestContext,
    query: GetNotificationsQueryDto,
  ) {
    this.logCaller(context, this.getNotifications);
    const where = this.getNotificationWhere(context, query);
    const count = await this.prisma.notification.count({
      where: where,
    });
    return this.output(NotificationOutputDto, {
      _count: count,
    });
  }

  getNotificationWhere(
    context: RequestContext,
    query: GetNotificationsQueryDto,
  ) {
    const where: Prisma.NotificationWhereInput = {
      accountId: context.account.id,
    };
    if (query.id) {
      where.id = {
        in: query.id,
      };
    }
    if (query.name) {
      where.title = {
        contains: query.name,
        mode: 'insensitive',
      };
    }
    if (query.read != null) {
      where.read = query.read;
    }
    if (query.type) {
      where.type = {
        in: query.type,
      };
    }
    return where;
  }

  getNotificationInclude(query?: GetNotificationByIdQueryDto) {
    const include: Prisma.NotificationInclude | undefined =
      query?.include == GetNotificationInclude.Data
        ? {
            activity: true,
            shift: true,
            organization: true,
            report: true,
          }
        : undefined;
    return include;
  }

  getNotificationSort(query: GetNotificationsQueryDto) {
    const sort: Prisma.NotificationOrderByWithAggregationInput = {};
    if (query.sort) {
      if (query.sort.includes(GetNotificationSort.CreatedAtAsc)) {
        sort.createdAt = 'asc';
      } else if (query.sort.includes(GetNotificationSort.CreatedAtDesc)) {
        sort.createdAt = 'desc';
      }
    }
    if (Object.keys(sort).length === 0) {
      return undefined;
    }
    return sort;
  }

  async getNotificationById(
    context: RequestContext,
    id: number,
    query: GetNotificationByIdQueryDto,
  ) {
    this.logCaller(context, this.getNotifications);
    const res = await this.prisma.notification.findUnique({
      where: {
        id: id,
        accountId: context.account.id,
      },
      include: this.getNotificationInclude(query),
    });
    if (res == null) {
      return null;
    }
    return this.mapToDto(res);
  }

  async markNotificationsAsRead(
    context: RequestContext,
    dto: MarkNotificationsAsReadInputDto,
  ) {
    this.logCaller(context, this.markNotificationsAsRead);
    await this.prisma.notification.updateMany({
      where: {
        id: {
          in: dto.id,
        },
        accountId: context.account.id,
      },
      data: {
        read: true,
      },
    });
    const notifications = await this.prisma.notification.findMany({
      where: {
        id: {
          in: dto.id,
        },
        accountId: context.account.id,
      },
    });
    return this.outputArray(NotificationOutputDto, notifications);
  }

  async deleteNotifications(
    context: RequestContext,
    dto: DeleteNotificationsInputDto,
  ) {
    this.logCaller(context, this.deleteNotifications);
    const notifications = await this.prisma.notification.findMany({
      where: {
        id: {
          in: dto.id,
        },
        accountId: context.account.id,
      },
    });
    const notificationIds = notifications.map((n) => n.id);
    await this.prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
    });
    return this.outputArray(NotificationOutputDto, notifications);
  }

  async sendNotification(
    context: RequestContext,
    dto: CreateNotificationInputDto,
  ) {
    this.logCaller(context, this.sendNotification);
    const res = {};
    if (dto.registrationTokens) {
      const mid =
        await this.firebaseService.firebaseMessaging.sendEachForMulticast({
          tokens: dto.registrationTokens,
          notification: {
            title: dto.title,
            body: dto.shortDescription ?? dto.description,
          },
          data: dto.data,
        });
      res['multicast'] = mid;
    }
    if (dto.topic) {
      const mid = await this.firebaseService.firebaseMessaging.sendToTopic(
        dto.topic,
        {
          notification: {
            title: dto.title,
            body: dto.shortDescription ?? dto.description,
          },
          data: dto.data,
        },
      );
      res['topic'] = mid;
    }
    return res;
  }

  mapToDto(raw: any) {
    return this.output(NotificationOutputDto, raw);
  }
}
