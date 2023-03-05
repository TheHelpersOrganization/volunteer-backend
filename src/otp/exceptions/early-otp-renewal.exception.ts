import { BaseApiException } from 'src/common/exceptions';

export class EarlyTokenRenewalException extends BaseApiException {
  constructor() {
    super('Token renewal request is too early');
  }
}
