import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ContactModule } from 'src/contact/contact.module';
import { LocationModule } from 'src/location/location.module';

import {
  ActivityShiftController,
  ModShiftController,
  ShiftController,
} from './controllers';
import { ModShiftService, ShiftService, ShiftSkillService } from './services';

@Module({
  imports: [CommonModule, LocationModule, ContactModule],
  controllers: [ActivityShiftController, ShiftController, ModShiftController],
  providers: [ShiftService, ShiftSkillService, ModShiftService],
  exports: [ShiftService, ShiftSkillService],
})
export class ShiftModule {}
