import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { SkillController } from './controllers';
import { SkillService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
