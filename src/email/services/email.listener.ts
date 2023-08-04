import { AccountRegisteredEvent } from '@app/auth/events';
import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { OtpType } from '@app/otp/constants';
import { OtpService } from '@app/otp/services';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';

@Injectable()
export class EmailListener extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {
    super(logger);
  }

  @OnEvent(AccountRegisteredEvent.eventName, { async: true })
  async handleAccountRegisteredEvent(event: AccountRegisteredEvent) {
    const context = event.context;
    this.logCaller(context, this.handleAccountRegisteredEvent);

    const account = event.account;

    // Generate OTP
    const otp = await this.otpService.createOtp(
      context,
      account.id,
      OtpType.EmailVerification,
    );

    // Send OTP to account email
    await this.emailService.sendEmailVerification(context, account.email, otp);
  }
}
