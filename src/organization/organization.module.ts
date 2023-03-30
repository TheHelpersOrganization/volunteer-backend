import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ContactModule } from '../contact/contact.module';
import { FileModule } from '../file/file.module';
import { LocationModule } from '../location/location.module';
import { OrganizationController } from './controllers';
import { OrganizationService } from './services';

@Module({
  imports: [CommonModule, FileModule, LocationModule, ContactModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
