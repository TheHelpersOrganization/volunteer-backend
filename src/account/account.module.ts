import { Module } from '@nestjs/common';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { CommonModule } from '../common/common.module';
import { AdminAccountController } from './controllers';
import { AccountController } from './controllers/account.controller';
import { AdminAccountService } from './services';
import { AccountService } from './services/account.service';

@Module({
  imports: [CommonModule],
  controllers: [AccountController, AdminAccountController],
  providers: [AccountService, AdminAccountService, JwtAuthStrategy],
  exports: [AccountService, AdminAccountService],
})
export class AccountModule {}
