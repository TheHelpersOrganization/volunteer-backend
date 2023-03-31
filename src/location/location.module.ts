import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { GoogleMapController, LocationController } from './controllers';
import { LocationService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [LocationController, GoogleMapController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
