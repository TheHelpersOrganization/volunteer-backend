import { BaseApiException } from 'src/common/exceptions';

export class InvalidTokenException extends BaseApiException {
  constructor() {
    super('The token is invalid or has been expired');
  }
}
