import { CommonModule } from '@app/common/common.module';
import { ContactModule } from '@app/contact/contact.module';
import { LocationModule } from '@app/location/location.module';
import { OrganizationModule } from '@app/organization/organization.module';
import { ProfileModule } from '@app/profile/profile.module';
import { ShiftSkillModule } from '@app/shift-skill/shift-skill.module';
import { Module } from '@nestjs/common';
import { ShiftVolunteerAuthService } from './auth/shift-volunteer-auth.service';
import {
  ActivityVolunteerController,
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
  imports: [
    CommonModule,
    LocationModule,
    ContactModule,
    ProfileModule,
    ShiftSkillModule,
    OrganizationModule,
  ],
  controllers: [
    ActivityVolunteerController,
    ShiftVolunteerController,
    ModShiftVolunteerController,
    IdentifiedShiftVolunteerController,
  ],
  providers: [
    ShiftVolunteerService,
    ShiftVolunteerTaskService,
    ModShiftVolunteerService,
    ShiftVolunteerAuthService,
  ],
  exports: [ShiftVolunteerService, ModShiftVolunteerService],
})
export class ShiftVolunteerModule {}
