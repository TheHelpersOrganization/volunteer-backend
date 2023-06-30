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
  CreateNotificationInputDto,
  GetNotificationByIdQueryDto,
  GetNotificationsQueryDto,
  MarkNotificationsAsReadInputDto,
  TestCreateNotificationInputDto,
} from '../dtos';
import { NotificationService } from '../services';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @ReqContext() context: RequestContext,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationService.getNotifications(context, query);
  }

  @Get('count')
  async countNotifications(
    @ReqContext() context: RequestContext,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationService.countNotifications(context, query);
  }

  @Get(':id')
  async getNotificationById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetNotificationByIdQueryDto,
  ) {
    return this.notificationService.getNotificationById(context, id, query);
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

  @Post('test/send-notification')
  async testSendNotification(
    @ReqContext() context: RequestContext,
    @Body() dto: TestCreateNotificationInputDto,
  ) {
    return this.notificationService.testSendNotification(context, dto);
  }
}
