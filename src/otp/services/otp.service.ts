import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import * as dayjs from 'dayjs';
import { gen } from 'n-digit-token';
import otpConfig from 'src/common/configs/subconfigs/otp.config';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';

import { PrismaService } from '../../prisma/prisma.service';
import { OtpType } from '../constants';
import { VerifyOtpDto } from '../dto';
import { OtpOutputDto } from '../dto/otp-output.dto';
import {
  EarlyTokenRenewalException,
  InvalidTokenException,
} from '../exceptions';

@Injectable()
export class OtpService extends AbstractService {
  constructor(
    @Inject(otpConfig.KEY)
    private readonly otpConfigApi: ConfigType<typeof otpConfig>,
    private readonly prisma: PrismaService,
    appLogger: AppLogger,
  ) {
    super(appLogger);
  }

  async getEffectiveOtp(
    ctx: RequestContext,
    type: OtpType,
  ): Promise<OtpOutputDto | null> {
    const lifeSec = this.otpConfigApi.lifeSec;

    const exist = await this.prisma.token.findUnique({
      where: {
        accountId_type: {
          accountId: ctx.account.id,
          type: type,
        },
      },
    });

    if (
      !exist ||
      dayjs(exist.createdAt).add(lifeSec, 'second').isBefore(dayjs())
    ) {
      return null;
    }

    return exist;
  }

  async createOtp(
    ctx: RequestContext,
    accountId: number,
    type: OtpType,
  ): Promise<string> {
    this.logCaller(ctx, this.createOtp);

    const renewSec = this.getRenewSec(type);
    this.logger.log(ctx, `type is ${type}`);

    const exist = await this.prisma.token.findUnique({
      where: {
        accountId_type: {
          accountId: accountId,
          type: type,
        },
      },
    });
    if (
      exist &&
      dayjs(exist.createdAt).add(renewSec, 'second').isAfter(dayjs())
    ) {
      throw new EarlyTokenRenewalException();
    }

    // Delete the old otp
    if (exist) {
      this.logger.log(ctx, 'old otp exist, delete it');
      await this.prisma.token.delete({
        where: {
          accountId_type: {
            accountId: accountId,
            type: type,
          },
        },
      });
    }

    // Generate 6-digit OTP and hash it
    const otp = gen(6);
    console.log(otp);
    const hashed = await hash(otp, 10);

    await this.prisma.token.create({
      data: {
        accountId: accountId,
        token: hashed,
        type: type,
      },
    });

    return otp;
  }

  async verifyOtp(
    ctx: RequestContext,
    accountId: number,
    verifyOtp: VerifyOtpDto,
    type: OtpType,
  ): Promise<void> {
    this.logCaller(ctx, this.verifyOtp);
    const lifeSec = this.otpConfigApi.lifeSec;

    const exist = await this.prisma.token.findUnique({
      where: {
        accountId_type: {
          accountId: accountId,
          type: type,
        },
      },
    });
    // Check if otp exists and not expires yet
    if (
      !exist ||
      dayjs(exist.createdAt.getTime()).add(lifeSec, 'second').isBefore(dayjs())
    ) {
      throw new InvalidTokenException();
    }

    // Compare with hashed otp
    const match = await compare(verifyOtp.token, exist.token);
    if (!match) {
      throw new InvalidTokenException();
    }

    // Delete the otp
    await this.prisma.token.delete({
      where: {
        accountId_type: {
          accountId: accountId,
          type: type,
        },
      },
    });
  }

  private getRenewSec(type: OtpType): number {
    let renewSec;
    switch (type) {
      case OtpType.ResetPassword:
        renewSec = this.otpConfigApi.passwordResetRenewSec;
        break;
      case OtpType.EmailVerification:
        renewSec = this.otpConfigApi.emailVerificationResetRenewSec;
        break;
      default:
        renewSec = 0;
        break;
    }
    return renewSec;
  }
}
