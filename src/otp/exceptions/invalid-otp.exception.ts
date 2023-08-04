import { BaseApiException } from '@app/common/exceptions';

export class InvalidTokenException extends BaseApiException {
  constructor() {
    super('The token is invalid or has been expired');
  }
}
