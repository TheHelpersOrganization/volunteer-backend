import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ContactModule } from 'src/contact/contact.module';
import { LocationModule } from 'src/location/location.module';

import { ProfileModule } from 'src/profile/profile.module';
import { ShiftSkillModule } from 'src/shift-skill/shift-skill.module';
import {
  ActivityShiftController,
  ModShiftController,
  ShiftController,
} from './controllers';
import { ModShiftService, ShiftService, ShiftTaskService } from './services';

@Module({
  imports: [
    CommonModule,
    LocationModule,
    ContactModule,
    ShiftSkillModule,
    ProfileModule,
  ],
  controllers: [ActivityShiftController, ShiftController, ModShiftController],
  providers: [ShiftService, ModShiftService, ShiftTaskService],
  exports: [ShiftService],
})
export class ShiftModule {}
