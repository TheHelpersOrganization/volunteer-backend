import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ProfileModule } from 'src/profile/profile.module';
import { ReportController } from './controllers';
import { ReportService } from './services';

@Module({
  imports: [CommonModule, ProfileModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
