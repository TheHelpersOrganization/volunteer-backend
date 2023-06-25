import { Body, Controller, Delete, Get, Put, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  BaseGetNotificationsQueryDto,
  MarkNotificationsAsReadInputDto,
} from '../dtos';
import { NotificationService } from '../services';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @ReqContext() context: RequestContext,
    @Query() query: BaseGetNotificationsQueryDto,
  ) {
    return this.notificationService.getNotifications(context, query);
  }

  @Put('mark-as-read')
  async markNotificationsAsRead(
    @ReqContext() context: RequestContext,
    @Body() dto: MarkNotificationsAsReadInputDto,
  ) {
    return this.notificationService.markNotificationsAsRead(context, dto);
  }

  @Delete()
  async deleteNotifications(
    @ReqContext() context: RequestContext,
    @Body() dto: MarkNotificationsAsReadInputDto,
  ) {
    return this.notificationService.deleteNotifications(context, dto);
  }
}
