import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { CommonModule } from '../common/common.module';
import { AccountController } from './controllers/account.controller';
import { Account } from './entities/account.entity';
import { AccountRepository } from './repositories/account.repository';
import { AccountService } from './services/account.service';
import { AccountAclService } from './services/account-acl.service';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Account])],
  providers: [
    AccountService,
    JwtAuthStrategy,
    AccountAclService,
    AccountRepository,
  ],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
