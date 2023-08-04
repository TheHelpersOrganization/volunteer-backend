import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { AuthModule } from '@app/auth/auth.module';
import { ProfileModule } from '@app/profile/profile.module';
import { RoleModule } from '@app/role/role.module';
import { ContactModule } from '../contact/contact.module';
import { FileModule } from '../file/file.module';
import { LocationModule } from '../location/location.module';
import {
  OrganizationAdminController,
  OrganizationController,
  OrganizationMemberController,
  OrganizationMemberModController,
  OrganizationModController,
} from './controllers';
import {
  OrganizationMemberService,
  OrganizationRoleService,
  OrganizationService,
} from './services';

@Module({
  imports: [
    CommonModule,
    FileModule,
    LocationModule,
    ContactModule,
    RoleModule,
    ProfileModule,
    AuthModule,
  ],
  controllers: [
    OrganizationController,
    OrganizationAdminController,
    OrganizationModController,
    OrganizationMemberController,
    OrganizationMemberModController,
  ],
  providers: [
    OrganizationService,
    OrganizationMemberService,
    OrganizationRoleService,
  ],
  exports: [
    OrganizationService,
    OrganizationMemberService,
    OrganizationRoleService,
  ],
})
export class OrganizationModule {}
