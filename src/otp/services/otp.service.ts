import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import * as dayjs from 'dayjs';
import { gen } from 'n-digit-token';
import otpConfig from 'src/common/configs/subconfigs/otp.config';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';

import { OtpType } from '../constants';
import { VerifyOtpDto } from '../dto';
import { OtpOutputDto } from '../dto/otp-output.dto';
import { EarlyOtpRenewalException, InvalidOtpException } from '../exceptions';
import { OtpRepository } from '../repositories';

@Injectable()
export class OtpService extends AbstractService {
  constructor(
    @Inject(otpConfig.KEY)
    private readonly otpConfigApi: ConfigType<typeof otpConfig>,
    private readonly otpRepository: OtpRepository,
    appLogger: AppLogger,
  ) {
    super(appLogger);
  }

  async getEffectiveOtp(
    ctx: RequestContext,
    type: OtpType,
  ): Promise<OtpOutputDto | null> {
    const lifeSec = this.otpConfigApi.lifeSec;

    const exist = await this.otpRepository.findOneBy({
      accountId: ctx.account.id,
      type: type,
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

    const exist = await this.otpRepository.findOneBy({
      accountId: accountId,
      type: type,
    });
    if (
      exist &&
      dayjs(exist.createdAt).add(renewSec, 'second').isAfter(dayjs())
    ) {
      throw new EarlyOtpRenewalException();
    }

    // Delete the old otp
    if (exist) {
      this.logger.log(ctx, 'old otp exist, delete it');
      await this.otpRepository.delete({
        accountId: accountId,
        type: type,
      });
    }

    // Generate 6-digit OTP and hash it
    const otp = gen(6);
    console.log(otp);
    const hashed = await hash(otp, 10);

    await this.otpRepository.save({
      accountId: accountId,
      otp: hashed,
      type: type,
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

    const exist = await this.otpRepository.findOneBy({
      accountId: accountId,
      type: type,
    });
    // Check if otp exists and not expires yet
    if (
      !exist ||
      dayjs(exist.createdAt.getTime()).add(lifeSec, 'second').isBefore(dayjs())
    ) {
      throw new InvalidOtpException();
    }

    // Compare with hashed otp
    const match = await compare(verifyOtp.otp, exist.otp);
    if (!match) {
      throw new InvalidOtpException();
    }

    // Delete the otp
    await this.otpRepository.delete({
      accountId: accountId,
      type: type,
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
