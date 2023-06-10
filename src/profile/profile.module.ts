import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ShiftModule } from 'src/shift/shift.module';
import { LocationModule } from '../location/location.module';
import { ProfileController } from './controllers';
import { ProfileListener, ProfileService } from './services';

@Module({
  imports: [CommonModule, LocationModule, ShiftModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileListener],
  exports: [ProfileService],
})
export class ProfileModule {}
