import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AccountRegisteredEvent } from 'src/auth/events';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { OtpType } from 'src/otp/constants';
import { OtpService } from 'src/otp/services';
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
