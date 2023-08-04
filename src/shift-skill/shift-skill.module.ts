import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';
import { ShiftSkillService } from './services';

@Module({
  imports: [CommonModule],
  providers: [ShiftSkillService],
  exports: [ShiftSkillService],
})
export class ShiftSkillModule {}
