import { BaseApiException } from 'src/common/exceptions';

export class ShiftHasAlreadyStartedException extends BaseApiException {
  constructor() {
    super('Shift has already started');
  }
}
