import { BaseApiException } from 'src/common/exceptions';

export class InvalidStatusException extends BaseApiException {
  constructor() {
    super('Invalid status');
  }
}
