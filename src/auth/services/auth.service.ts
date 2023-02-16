import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';

import { AccountOutput } from '../../account/dtos/account-output.dto';
import { AccountService } from '../../account/services/account.service';
import { AppLogger } from '../../common/logger/logger.service';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { ROLE } from '../constants/role.constant';
import { RegisterInput } from '../dtos/auth-register-input.dto';
import { RegisterOutput } from '../dtos/auth-register-output.dto';
import {
  AccountAccessTokenClaims,
  AuthTokenOutput,
} from '../dtos/auth-token-output.dto';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  private readonly refreshTokenExpirationTime = this.configService.get(
    'jwt.refreshTokenExpiresInSec',
  );
  private readonly accessTokenExpirationTime = this.configService.get(
    'jwt.accessTokenExpiresInSec',
  );

  async validateAccount(
    ctx: RequestContext,
    email: string,
    password: string,
  ): Promise<AccountAccessTokenClaims> {
    this.logger.log(ctx, `${this.validateAccount.name} was called`);

    // The userService will throw Unauthorized in case of invalid email/password.
    const account = await this.accountService.validateEmailPassword(
      ctx,
      email,
      password,
    );

    // Prevent disabled users from logging in.
    if (account.isAccountDisabled) {
      throw new UnauthorizedException('This user account has been disabled');
    }

    return account;
  }

  login(ctx: RequestContext): AuthTokenOutput {
    this.logger.log(ctx, `${this.login.name} was called`);

    return this.getAuthToken(ctx, ctx.account);
  }

  async register(
    ctx: RequestContext,
    input: RegisterInput,
  ): Promise<RegisterOutput> {
    this.logger.log(ctx, `${this.register.name} was called`);

    // TODO : Setting default role as USER here. Will add option to change this later via ADMIN users.
    input.roles = [ROLE.USER];
    input.isAccountDisabled = false;

    const registeredAccount = await this.accountService.createAccount(
      ctx,
      input,
    );
    return plainToClass(RegisterOutput, registeredAccount, {
      excludeExtraneousValues: true,
    });
  }

  async refreshToken(ctx: RequestContext): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const account = await this.accountService.findById(ctx, ctx.account.id);
    if (!account) {
      throw new UnauthorizedException('Invalid user id');
    }

    return this.getAuthToken(ctx, account);
  }

  getAuthToken(
    ctx: RequestContext,
    account: AccountAccessTokenClaims | AccountOutput,
  ): AuthTokenOutput {
    this.logger.log(ctx, `${this.getAuthToken.name} was called`);

    const subject = { sub: account.id };
    const payload = {
      email: account.email,
      sub: account.id,
      roles: account.roles,
    };

    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        expiresIn: this.refreshTokenExpirationTime,
      }),
      accessToken: this.jwtService.sign(
        { ...payload, ...subject },
        { expiresIn: this.accessTokenExpirationTime },
      ),
    };
    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true,
    });
  }
}
