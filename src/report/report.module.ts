import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ReportController } from './controllers';
import { ReportService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
