import { Controller, Get, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { BaseGetNotificationsQueryDto } from '../dtos';
import { NotificationService } from '../services';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('me')
  async getMyNotifications(
    @ReqContext() context: RequestContext,
    @Query() query: BaseGetNotificationsQueryDto,
  ) {
    return this.notificationService.getRequesterNotifications(context, query);
  }
}
