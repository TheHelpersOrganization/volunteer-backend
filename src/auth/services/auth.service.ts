import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToClass, plainToInstance } from 'class-transformer';
import { EmailService } from 'src/email/services';
import { OtpType } from 'src/otp/constants';
import { OtpService } from 'src/otp/services';

import { AccountOutputDto } from '../../account/dtos/account-output.dto';
import { AccountService } from '../../account/services/account.service';
import { AppLogger } from '../../common/logger/logger.service';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { ROLE } from '../constants/role.constant';
import { VerifyAccountDto, VerifyAccountTokenInputDto } from '../dtos';
import { RegisterInput } from '../dtos/auth-register-input.dto';
import { RegisterOutput } from '../dtos/auth-register-output.dto';
import {
  AccountAccessTokenClaims,
  AccountTokenOutputDto,
} from '../dtos/auth-token-output.dto';
import { TokenOutputDto } from '../dtos/token-output.dto';
import { VerifyAccountOutputDto } from '../dtos/verify-account-output.dto';
import { AccountNotFoundException } from '../exceptions/account-not-found.exception';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    private configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  private readonly refreshTokenExpirationTime = this.configService.get(
    'auth.refreshTokenLifeSec',
  );
  private readonly accessTokenExpirationTime = this.configService.get(
    'auth.accessTokenLifeSec',
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

  async login(ctx: RequestContext): Promise<AccountTokenOutputDto> {
    this.logger.log(ctx, `${this.login.name} was called`);

    const token = this.getAuthToken(ctx, ctx.account);
    const account = await this.accountService.findById(ctx, ctx.account.id);

    return plainToClass(
      AccountTokenOutputDto,
      {
        token: token,
        account: account,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async register(
    ctx: RequestContext,
    input: RegisterInput,
  ): Promise<RegisterOutput> {
    this.logger.log(ctx, `${this.register.name} was called`);

    // TODO : Setting default role as USER here. Will add option to change this later via ADMIN users.
    input.roles = [ROLE.USER];
    input.isAccountDisabled = false;
    input.isAccountVerified = false;

    const registeredAccount = await this.accountService.createAccount(
      ctx,
      input,
    );

    // Generate OTP
    const otp = await this.otpService.createOtp(
      ctx,
      registeredAccount.id,
      OtpType.EmailVerification,
    );

    // Send OTP to account email
    // No need to wait for sendOtp
    this.emailService.sendEmailVerification(ctx, registeredAccount.email, otp);

    return plainToClass(RegisterOutput, registeredAccount, {
      excludeExtraneousValues: true,
    });
  }

  async refreshToken(ctx: RequestContext): Promise<AccountTokenOutputDto> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const account = await this.accountService.findById(ctx, ctx.account.id);
    if (!account) {
      throw new UnauthorizedException('Invalid user id');
    }

    return plainToInstance(
      AccountTokenOutputDto,
      {
        token: this.getAuthToken(ctx, account),
        account: account,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  getAuthToken(
    ctx: RequestContext,
    account: AccountAccessTokenClaims | AccountOutputDto,
  ): TokenOutputDto {
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
    return plainToClass(TokenOutputDto, authToken, {
      excludeExtraneousValues: true,
    });
  }

  async verifyAccount(
    ctx: RequestContext,
    dto: VerifyAccountDto,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.verifyAccount.name} was called`);

    const account = await this.accountService.findByEmail(ctx, dto.email);
    if (!account) {
      throw new AccountNotFoundException();
    }

    await this.otpService.verifyOtp(
      ctx,
      account.id,
      { token: dto.token },
      OtpType.EmailVerification,
    );

    const updatedAccount = await this.accountService.markAccountAsVerified(
      ctx,
      account.id,
    );

    return updatedAccount;
  }

  async createVerifyAccountToken(
    ctx: RequestContext,
    dto: VerifyAccountTokenInputDto,
  ): Promise<VerifyAccountOutputDto> {
    this.logger.log(ctx, `${this.createVerifyAccountToken.name} was called`);

    const account = await this.accountService.findByEmail(ctx, dto.email);
    if (!account) {
      throw new AccountNotFoundException();
    }

    const otp = await this.otpService.createOtp(
      ctx,
      account.id,
      OtpType.EmailVerification,
    );
    this.emailService.sendEmailVerification(ctx, account.email, otp);

    return {
      successful: true,
    };
  }
}
