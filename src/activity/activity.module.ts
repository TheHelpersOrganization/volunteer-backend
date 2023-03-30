import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ActivityController } from './controllers';
import { ActivityService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
