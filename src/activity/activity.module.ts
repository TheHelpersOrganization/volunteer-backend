import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ActivityController, ModActivityController } from './controllers';
import { ActivityService, ModActivityService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [ActivityController, ModActivityController],
  providers: [ActivityService, ModActivityService],
})
export class ActivityModule {}
