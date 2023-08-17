import { BaseApiException } from '@app/common/exceptions/base-api.exception';

export class AccountNotFoundException extends BaseApiException {
  constructor() {
    super({
      message: 'There is no user record corresponding to this identifier',
      status: 404,
    });
  }
}
