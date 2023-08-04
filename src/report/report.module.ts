import { AccountModule } from '@app/account/account.module';
import { CommonModule } from '@app/common/common.module';
import { ProfileModule } from '@app/profile/profile.module';
import { Module } from '@nestjs/common';
import { ReportController } from './controllers';
import { ReportService } from './services';

@Module({
  imports: [CommonModule, AccountModule, ProfileModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
