import { AccountOutputDto } from '@app/account/dtos';
import { AbstractEvent } from '@app/common/events';
import { RequestContext } from '@app/common/request-context';

export class AccountRegisteredEvent extends AbstractEvent {
  static eventName = 'account.registered';

  constructor(
    context: RequestContext,
    public readonly account: AccountOutputDto,
  ) {
    super(context);
  }
}
