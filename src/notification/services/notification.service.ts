import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import {
  BaseGetNotificationsQueryDto,
  GetNotificationsQueryDto,
} from '../dtos';

@Injectable()
export class NotificationService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getNotifications(
    context: RequestContext,
    query: GetNotificationsQueryDto,
  ) {
    return this.prisma.notification.findMany({
      where: {
        id: {
          in: query.id,
        },
        accountId: {
          in: query.accountId,
        },
      },
      take: query.limit,
      skip: query.offset,
    });
  }

  async getRequesterNotifications(
    context: RequestContext,
    query: BaseGetNotificationsQueryDto,
  ) {
    return this.prisma.notification.findMany({
      where: {
        id: {
          in: query.id,
        },
        accountId: context.account.id,
      },
      take: query.limit,
      skip: query.offset,
    });
  }
}
