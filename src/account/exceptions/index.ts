import { BaseApiException } from '@app/common/exceptions';

export class UnableToBanSelfAccountException extends BaseApiException {
  constructor() {
    super({ message: 'Unable to ban your own account' });
  }
}
