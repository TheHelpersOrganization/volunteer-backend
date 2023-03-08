import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';

import { OrganizationController } from './controllers';
import { Organization } from './entities';
import { OrganizationRepository } from './repositories';
import { OrganizationService } from './services';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
})
export class OrganizationModule {}
