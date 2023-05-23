import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ContactModule } from 'src/contact/contact.module';
import { LocationModule } from 'src/location/location.module';

import {
  ActivityShiftController,
  ActivityVolunteer,
  ShiftController,
  ShiftVolunteerController,
} from './controllers';
import {
  ShiftService,
  ShiftSkillService,
  ShiftVolunteerService,
  ShiftVolunteerTaskService,
} from './services';

@Module({
  imports: [CommonModule, LocationModule, ContactModule],
  controllers: [
    ActivityShiftController,
    ActivityVolunteer,
    ShiftController,
    ShiftVolunteerController,
  ],
  providers: [
    ShiftService,
    ShiftVolunteerService,
    ShiftVolunteerTaskService,
    ShiftSkillService,
  ],
  exports: [ShiftService, ShiftVolunteerService, ShiftSkillService],
})
export class ShiftModule {}
