import { AccountRegisteredEvent } from '@app/auth/events';
import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProfileService } from './profile.service';

@Injectable()
export class ProfileListener extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly profileService: ProfileService,
  ) {
    super(logger);
  }

  @OnEvent(AccountRegisteredEvent.eventName, { async: true })
  async handleAccountRegisteredEvent(event: AccountRegisteredEvent) {
    const context = event.context;
    this.logCaller(context, this.handleAccountRegisteredEvent);

    const account = event.account;

    // Create profile
    await this.profileService.getProfile(context, account.id);
  }
}
