import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  BaseGetNotificationsQueryDto,
  CreateNotificationInputDto,
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

  @Get('count')
  async countNotifications(
    @ReqContext() context: RequestContext,
    @Query() query: BaseGetNotificationsQueryDto,
  ) {
    return this.notificationService.countNotifications(context, query);
  }

  @Get(':id')
  async getNotificationById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationService.getNotificationById(context, id);
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

  @Post()
  async sendNotification(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateNotificationInputDto,
  ) {
    return this.notificationService.sendNotification(context, dto);
  }
}
