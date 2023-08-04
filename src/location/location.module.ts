import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { LocationController } from './controllers';
import { LocationService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
