import { Module } from '@nestjs/common';

import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule, AccountModule, AuthModule],
})
export class AppModule {}
