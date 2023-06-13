import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ShiftSkillModule } from 'src/shift-skill/shift-skill.module';
import { ShiftModule } from 'src/shift/shift.module';
import { LocationModule } from '../location/location.module';
import { ProfileController } from './controllers';
import { ProfileListener, ProfileService } from './services';

@Module({
  imports: [CommonModule, LocationModule, ShiftModule, ShiftSkillModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileListener],
  exports: [ProfileService],
})
export class ProfileModule {}
