import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { OtpService } from './services/otp.service';

@Module({
  imports: [CommonModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
