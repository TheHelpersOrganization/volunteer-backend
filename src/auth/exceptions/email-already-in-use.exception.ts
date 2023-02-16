import { BaseApiException } from 'src/common/exceptions/base-api.exception';

export class EmailAlreadyInUseException extends BaseApiException {
  constructor() {
    super('The email address is already in use by another account');
  }
}
