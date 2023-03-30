import { BaseApiException } from 'src/common/exceptions';

export class ShiftNotFoundException extends BaseApiException {
  constructor() {
    super('Shift not found', undefined, 404);
  }
}
