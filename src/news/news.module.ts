import { ActivityModule } from '@app/activity/activity.module';
import { CommonModule } from '@app/common/common.module';
import { OrganizationModule } from '@app/organization/organization.module';
import { ProfileModule } from '@app/profile/profile.module';
import { Module } from '@nestjs/common';
import { NewsController } from './controllers';
import {
  NewsAuthorizationService,
  NewsService,
  NewsTaskService,
} from './services';

@Module({
  imports: [CommonModule, ProfileModule, OrganizationModule, ActivityModule],
  controllers: [NewsController],
  providers: [NewsService, NewsAuthorizationService, NewsTaskService],
  exports: [NewsService, NewsAuthorizationService],
})
export class NewsModule {}
