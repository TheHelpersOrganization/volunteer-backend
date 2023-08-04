import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { NotificationModule } from '@app/notification/notification.module';
import { OrganizationModule } from '@app/organization/organization.module';
import { ActivityController, ModActivityController } from './controllers';
import {
  ActivityRoleService,
  ActivityService,
  ModActivityService,
} from './services';

@Module({
  imports: [CommonModule, NotificationModule, OrganizationModule],
  controllers: [ActivityController, ModActivityController],
  providers: [ActivityService, ModActivityService, ActivityRoleService],
  exports: [ActivityService, ModActivityService],
})
export class ActivityModule {}
