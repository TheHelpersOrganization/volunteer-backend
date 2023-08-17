import { BaseApiException } from '@app/common/exceptions';

export class InvalidTokenException extends BaseApiException {
  constructor() {
    super({ message: 'The token is invalid or has been expired' });
  }
}
