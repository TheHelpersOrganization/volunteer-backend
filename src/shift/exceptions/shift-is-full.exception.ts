import { BaseApiException } from 'src/common/exceptions';

export class ShiftIsFullException extends BaseApiException {
  constructor() {
    super('Shift is full');
  }
}
