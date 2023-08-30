import { ActivityModule } from '@app/activity/activity.module';
import { CommonModule } from '@app/common/common.module';
import { ProfileModule } from '@app/profile/profile.module';
import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers';
import { AnalyticsService } from './services';

@Module({
  imports: [CommonModule, ProfileModule, ActivityModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
