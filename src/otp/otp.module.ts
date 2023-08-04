import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { OtpService } from './services/otp.service';

@Module({
  imports: [CommonModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
