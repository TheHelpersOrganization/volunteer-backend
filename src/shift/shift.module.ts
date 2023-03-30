import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ContactModule } from 'src/contact/contact.module';
import { LocationModule } from 'src/location/location.module';

import {
  ActivityShiftController,
  ShiftController,
  ShiftVolunteerController,
} from './controllers';
import { ShiftService, ShiftVolunteerService } from './services';

@Module({
  imports: [CommonModule, LocationModule, ContactModule],
  controllers: [
    ActivityShiftController,
    ShiftController,
    ShiftVolunteerController,
  ],
  providers: [ShiftService, ShiftVolunteerService],
})
export class ShiftModule {}
