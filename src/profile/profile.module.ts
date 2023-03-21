import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { LocationModule } from '../location/location.module';
import { ProfileController } from './controllers';
import { ProfileService } from './services';

@Module({
  imports: [CommonModule, LocationModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
