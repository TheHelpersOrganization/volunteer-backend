import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ContactModule } from 'src/contact/contact.module';
import { LocationModule } from 'src/location/location.module';
import { ProfileModule } from 'src/profile/profile.module';
import {
  ActivityVolunteer,
  IdentifiedShiftVolunteerController,
  ModShiftVolunteerController,
  ShiftVolunteerController,
} from './controllers';
import {
  ModShiftVolunteerService,
  ShiftVolunteerService,
  ShiftVolunteerTaskService,
} from './services';

@Module({
  imports: [CommonModule, LocationModule, ContactModule, ProfileModule],
  controllers: [
    ActivityVolunteer,
    ShiftVolunteerController,
    ModShiftVolunteerController,
    IdentifiedShiftVolunteerController,
  ],
  providers: [
    ShiftVolunteerService,
    ShiftVolunteerTaskService,
    ModShiftVolunteerService,
  ],
  exports: [ShiftVolunteerService, ModShiftVolunteerService],
})
export class ShiftVolunteerModule {}
