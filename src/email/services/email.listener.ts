import { AccountRegisteredEvent } from '@app/auth/events';
import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { TokenType } from '@app/token/constants';
import { TokenService } from '@app/token/services';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';

@Injectable()
export class EmailListener extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {
    super(logger);
  }

  @OnEvent(AccountRegisteredEvent.eventName, { async: true })
  async handleAccountRegisteredEvent(event: AccountRegisteredEvent) {
    const context = event.context;
    this.logCaller(context, this.handleAccountRegisteredEvent);

    const account = event.account;

    // Generate TOKEN
    const token = await this.tokenService.createToken(
      context,
      account.id,
      TokenType.EmailVerification,
    );

    // Send TOKEN to account email
    await this.emailService.sendEmailVerificationEmail(
      context,
      account.email,
      token,
    );
  }
}
