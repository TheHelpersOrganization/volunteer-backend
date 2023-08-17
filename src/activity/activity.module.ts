import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { NotificationModule } from '@app/notification/notification.module';
import { OrganizationModule } from '@app/organization/organization.module';
import { ShiftVolunteerModule } from '@app/shift-volunteer/shift-volunteer.module';
import { ActivityAuthService } from './auth';
import { ActivityController, ModActivityController } from './controllers';
import { ActivityService, ModActivityService } from './services';

@Module({
  imports: [
    CommonModule,
    NotificationModule,
    OrganizationModule,
    ShiftVolunteerModule,
  ],
  controllers: [ActivityController, ModActivityController],
  providers: [ActivityService, ModActivityService, ActivityAuthService],
  exports: [ActivityService, ModActivityService],
})
export class ActivityModule {}
