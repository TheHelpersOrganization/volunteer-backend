import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';

import { Location } from './entities';
import { LocationRepository } from './repositories';
import { LocationService } from './services';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Location])],
  providers: [LocationService, LocationRepository],
  exports: [LocationService],
})
export class LocationModule {}
