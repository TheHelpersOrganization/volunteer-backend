import tokenConfig from '@app/common/configs/subconfigs/token.config';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { secondsToHoursMinutesSeconds } from '@app/common/utils';
import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class EmailService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly mailerService: MailerService,
    @Inject(tokenConfig.KEY)
    private readonly tokenConfigApi: ConfigType<typeof tokenConfig>,
  ) {
    super(logger);
  }

  async sendEmailVerificationEmail(
    ctx: RequestContext,
    email: string,
    token: string,
  ) {
    this.logCaller(ctx, this.sendEmailVerificationEmail);
    const tokenLife = secondsToHoursMinutesSeconds(this.tokenConfigApi.lifeSec);
    try {
      const res = await this.mailerService.sendMail({
        to: email,
        subject: 'TheHelpers Account Email Verification - Action Required',
        text: `Please confirm your email address. Here is the code: ${token}. Note: The code will be expired after ${tokenLife}.`,
        template: 'email-verify-account',
        context: {
          token: token,
          tokenLife: tokenLife,
        },
      });
      this.logger.log(ctx, `successfully send email ${res.messageId}`);
    } catch (err) {
      this.logger.warn(ctx, `cannot send email: "${err}"`);
    }
  }

  async sendResetPasswordEmail(
    ctx: RequestContext,
    email: string,
    token: string,
  ) {
    this.logCaller(ctx, this.sendResetPasswordEmail);
    const tokenLife = secondsToHoursMinutesSeconds(this.tokenConfigApi.lifeSec);
    try {
      const res = await this.mailerService.sendMail({
        to: email,
        subject: 'TheHelpers Account Password Reset - Action Required',
        text: `Please confirm your password reset. Here is the code: ${token}. Note: The code will be expired after ${tokenLife}.`,
        template: 'email-reset-password',
        context: {
          token: token,
          tokenLife: tokenLife,
        },
      });
      ('Use the code below to reset your password. Note: The code will be expired after 15 minutes.');
      this.logger.log(ctx, `successfully send email ${res.messageId}`);
    } catch (err) {
      this.logger.warn(ctx, `cannot send email: "${err}"`);
    }
  }
}
