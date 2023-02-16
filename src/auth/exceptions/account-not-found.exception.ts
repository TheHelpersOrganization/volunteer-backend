import { BaseApiException } from 'src/common/exceptions/base-api.exception';

export class AccountNotFoundException extends BaseApiException {
  constructor() {
    super('There is no user record corresponding to this identifier');
  }
}
