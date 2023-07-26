import { BaseApiException } from 'src/common/exceptions';

export class WrongPasswordException extends BaseApiException {
  constructor() {
    super('Wrong account password');
  }
}
