import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { LocationController } from './controllers';
import { LocationService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
