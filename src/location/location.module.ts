import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { LocationService } from './services';

@Module({
  imports: [CommonModule],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
