import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { NotificationModule } from 'src/notification/notification.module';
import { ActivityController, ModActivityController } from './controllers';
import { ActivityService, ModActivityService } from './services';

@Module({
  imports: [CommonModule, NotificationModule],
  controllers: [ActivityController, ModActivityController],
  providers: [ActivityService, ModActivityService],
  exports: [ActivityService, ModActivityService],
})
export class ActivityModule {}
