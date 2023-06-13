import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ShiftSkillService } from './services';

@Module({
  imports: [CommonModule],
  providers: [ShiftSkillService],
  exports: [ShiftSkillService],
})
export class ShiftSkillModule {}
