import { CommonModule } from '@app/common/common.module';
import { ContactModule } from '@app/contact/contact.module';
import { LocationModule } from '@app/location/location.module';
import { Module } from '@nestjs/common';

import { ActivityModule } from '@app/activity/activity.module';
import { ProfileModule } from '@app/profile/profile.module';
import { ShiftSkillModule } from '@app/shift-skill/shift-skill.module';
import { ShiftVolunteerModule } from '@app/shift-volunteer/shift-volunteer.module';
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
    ActivityModule,
    ShiftVolunteerModule,
  ],
  controllers: [ActivityShiftController, ShiftController, ModShiftController],
  providers: [ShiftService, ModShiftService, ShiftTaskService],
  exports: [ShiftService],
})
export class ShiftModule {}
