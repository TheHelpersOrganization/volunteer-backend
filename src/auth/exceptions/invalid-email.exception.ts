import { BaseApiException } from '@app/common/exceptions/base-api.exception';

export class InvalidEmailException extends BaseApiException {
  constructor() {
    super('The email address is badly formatted');
  }
}
