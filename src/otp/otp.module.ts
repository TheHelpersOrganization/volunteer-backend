import { Module } from '@nestjs/common';

import { OtpController } from './controllers';
import { OtpService } from './services/otp.service';

@Module({
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
