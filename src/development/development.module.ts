import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';
import { TestShiftController } from './controllers';

@Module({
  imports: [CommonModule],
  controllers: [TestShiftController],
  providers: [],
  exports: [],
})
export class DevelopmentModule {}
