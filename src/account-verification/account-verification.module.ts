import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';
import { AccountVerificationController } from './controllers';
import { AccountVerificationService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [AccountVerificationController],
  providers: [AccountVerificationService],
  exports: [AccountVerificationService],
})
export class AccountVerificationModule {}
