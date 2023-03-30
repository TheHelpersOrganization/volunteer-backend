import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { SkillController } from './controllers';
import { SkillService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
