import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';

import { Otp } from './entities';
import { OtpRepository } from './repositories';
import { OtpService } from './services/otp.service';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Otp])],
  providers: [OtpService, OtpRepository],
  exports: [OtpService],
})
export class OtpModule {}
