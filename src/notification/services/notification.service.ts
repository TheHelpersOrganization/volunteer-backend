import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import {
  BaseGetNotificationsQueryDto,
  DeleteNotificationsInputDto,
  MarkNotificationsAsReadInputDto,
} from '../dtos';
import { NotificationOutputDto } from '../dtos/notification.output.dto';

@Injectable()
export class NotificationService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getNotifications(
    context: RequestContext,
    query: BaseGetNotificationsQueryDto,
  ) {
    this.logCaller(context, this.getNotifications);
    const where = this.getNotificationWhere(context, query);
    const res = await this.prisma.notification.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
    });
    return this.outputArray(NotificationOutputDto, res);
  }

  getNotificationWhere(
    context: RequestContext,
    query: BaseGetNotificationsQueryDto,
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
    return where;
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
}
