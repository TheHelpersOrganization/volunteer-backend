import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';

@Injectable()
export class EmailService extends AbstractService {
  constructor(
    private readonly mailerService: MailerService,
    logger: AppLogger,
  ) {
    super(logger);
  }

  async sendEmailVerification(ctx: RequestContext, email: string, otp: string) {
    this.logCaller(ctx, this.sendEmailVerification);
    try {
      const res = await this.mailerService.sendMail({
        to: email,
        subject: 'TheHelpers Account Email Verification - Action Required',
        text: `Please confirm your email address. Here is the code: ${otp}. Note: The code will be expired after 5 minutes`,
        template: 'email-verify-account',
        context: {
          otp: otp,
          otpLife: '5 minutes',
        },
      });
      this.logger.log(ctx, `successfully send email ${res.messageId}`);
    } catch (err) {
      this.logger.warn(ctx, `cannot send email: "${err}"`);
    }
  }
}
