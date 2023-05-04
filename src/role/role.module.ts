import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { RoleService } from './services';

@Module({
  imports: [CommonModule],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
