import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { AuthModule } from 'src/auth/auth.module';
import { ProfileModule } from 'src/profile/profile.module';
import { RoleModule } from 'src/role/role.module';
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
