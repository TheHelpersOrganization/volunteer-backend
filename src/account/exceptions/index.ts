import { BaseApiException } from '@app/common/exceptions';

export class UnableToBanSelfAccountException extends BaseApiException {
  constructor() {
    super('Unable to ban your own account');
  }
}
