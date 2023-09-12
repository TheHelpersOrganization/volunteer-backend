import { ActivityModule } from '@app/activity/activity.module';
import { CommonModule } from '@app/common/common.module';
import { ProfileModule } from '@app/profile/profile.module';
import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers';
import { AnalyticsService } from './services';
import { AnalyticsTaskService } from './tasks';

@Module({
  imports: [CommonModule, ProfileModule, ActivityModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsTaskService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
