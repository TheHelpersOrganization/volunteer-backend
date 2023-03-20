import { Module } from '@nestjs/common';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { CommonModule } from '../common/common.module';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { AccountAclService } from './services/account-acl.service';

@Module({
  imports: [CommonModule],
  providers: [AccountService, JwtAuthStrategy, AccountAclService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
