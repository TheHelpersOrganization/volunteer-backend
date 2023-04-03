import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ContactModule } from '../contact/contact.module';
import { FileModule } from '../file/file.module';
import { LocationModule } from '../location/location.module';
import {
  OrganizationController,
  OrganizationMemberController,
} from './controllers';
import { OrganizationMemberService, OrganizationService } from './services';

@Module({
  imports: [CommonModule, FileModule, LocationModule, ContactModule],
  controllers: [OrganizationController, OrganizationMemberController],
  providers: [OrganizationService, OrganizationMemberService],
  exports: [OrganizationService, OrganizationMemberService],
})
export class OrganizationModule {}
