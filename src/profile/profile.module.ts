import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ShiftSkillModule } from 'src/shift-skill/shift-skill.module';
import { LocationModule } from '../location/location.module';
import { ProfileController } from './controllers';
import { ProfileListener, ProfileService } from './services';
import { ProfileSkillService } from './services/profile-skill.service';

@Module({
  imports: [CommonModule, LocationModule, ShiftSkillModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileListener, ProfileSkillService],
  exports: [ProfileService, ProfileSkillService],
})
export class ProfileModule {}
