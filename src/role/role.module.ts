import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';
import { RoleService } from './services';

@Module({
  imports: [CommonModule],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
