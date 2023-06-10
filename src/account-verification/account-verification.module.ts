import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { AccountVerificationController } from './controllers';
import { AccountVerificationService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [AccountVerificationController],
  providers: [AccountVerificationService],
  exports: [AccountVerificationService],
})
export class AccountVerificationModule {}
