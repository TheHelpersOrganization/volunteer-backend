import { BaseApiException } from '@app/common/exceptions';

export class EarlyTokenRenewalException extends BaseApiException {
  constructor() {
    super('Token renewal request is too early');
  }
}
