import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ContactModule } from 'src/contact/contact.module';
import { LocationModule } from 'src/location/location.module';
import {
  ActivityVolunteer,
  ModShiftVolunteerController,
  ShiftVolunteerController,
} from './controllers';
import {
  ModShiftVolunteerService,
  ShiftVolunteerService,
  ShiftVolunteerTaskService,
} from './services';

@Module({
  imports: [CommonModule, LocationModule, ContactModule],
  controllers: [
    ActivityVolunteer,
    ShiftVolunteerController,
    ModShiftVolunteerController,
  ],
  providers: [
    ShiftVolunteerService,
    ShiftVolunteerTaskService,
    ModShiftVolunteerService,
  ],
  exports: [ShiftVolunteerService],
})
export class ShiftVolunteerModule {}
