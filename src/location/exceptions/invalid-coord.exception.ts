import { BaseApiException } from '@app/common/exceptions';

export class InvalidCoordinateException extends BaseApiException {
  constructor() {
    super('Invalid coordinate');
  }
}
