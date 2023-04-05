import { Module } from '@nestjs/common';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { CommonModule } from '../common/common.module';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';

@Module({
  imports: [CommonModule],
  providers: [AccountService, JwtAuthStrategy],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
