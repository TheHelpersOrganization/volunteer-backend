import { BaseApiException } from 'src/common/exceptions';

export class ShiftNotFoundException extends BaseApiException {
  constructor() {
    super('Shift not found', undefined, 404);
  }
}

export class ShiftIsFullException extends BaseApiException {
  constructor() {
    super('Shift is full');
  }
}

export class InvalidStatusException extends BaseApiException {
  constructor() {
    super('Invalid status');
  }
}

export class ShiftHasStartedException extends BaseApiException {
  constructor() {
    super('Shift has started');
  }
}

export class ShiftHasEndedException extends BaseApiException {
  constructor() {
    super('Shift has ended');
  }
}

export class ShiftHasNotYetStartedException extends BaseApiException {
  constructor() {
    super('Shift has not yet started');
  }
}

export class ShiftHasNotYetEndedException extends BaseApiException {
  constructor() {
    super('Shift has not yet ended');
  }
}

export class ShiftCheckInTimeLimitExceededException extends BaseApiException {
  constructor() {
    super('Shift check in time limit exceeded');
  }
}

export class ShiftCheckOutTimeLimitExceededException extends BaseApiException {
  constructor() {
    super('Shift check out time limit exceeded');
  }
}
