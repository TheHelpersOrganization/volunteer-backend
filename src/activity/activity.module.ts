import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { NotificationModule } from 'src/notification/notification.module';
import { OrganizationModule } from 'src/organization/organization.module';
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
