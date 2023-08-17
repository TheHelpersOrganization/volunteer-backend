import { BaseApiException } from '@app/common/exceptions/base-api.exception';

export class EmailAlreadyInUseException extends BaseApiException {
  constructor() {
    super({
      message: 'The email address is already in use by another account',
    });
  }
}
