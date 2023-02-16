import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CommonModule } from '../common/common.module';
import { AccountModule } from '../account/account.module';
import { STRATEGY_JWT_AUTH } from './constants/strategy.constant';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    CommonModule,
    PassportModule.register({ defaultStrategy: STRATEGY_JWT_AUTH }),
    JwtModule.registerAsync({
      imports: [CommonModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.secret'),
      }),
      inject: [ConfigService],
    }),
    AccountModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
