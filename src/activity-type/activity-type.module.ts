import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ActivityTypeController } from './controllers';
import { ActivityTypeService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [ActivityTypeController],
  providers: [ActivityTypeService],
  exports: [ActivityTypeService],
})
export class ActivityTypeModule {}
