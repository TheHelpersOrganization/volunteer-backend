import { BaseApiException } from '@app/common/exceptions';

export class WrongPasswordException extends BaseApiException {
  constructor() {
    super({ message: 'Wrong account password' });
  }
}
