import { BaseApiException } from '@app/common/exceptions';

export class ShiftNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Shift not found', status: 404 });
  }
}

export class ShiftIsFullException extends BaseApiException {
  constructor() {
    super({ message: 'Shift is full' });
  }
}

export class InvalidStatusException extends BaseApiException {
  constructor() {
    super({ message: 'Invalid status' });
  }
}

export class ShiftHasStartedException extends BaseApiException {
  constructor() {
    super({ message: 'Shift has started' });
  }
}

export class ShiftHasEndedException extends BaseApiException {
  constructor() {
    super({ message: 'Shift has ended' });
  }
}

export class ShiftHasNotYetStartedException extends BaseApiException {
  constructor() {
    super({ message: 'Shift has not yet started' });
  }
}

export class ShiftHasNotYetEndedException extends BaseApiException {
  constructor() {
    super({ message: 'Shift has not yet ended' });
  }
}

export class ShiftCheckInTimeLimitExceededException extends BaseApiException {
  constructor() {
    super({ message: 'Shift check in time limit exceeded' });
  }
}

export class ShiftCheckOutTimeLimitExceededException extends BaseApiException {
  constructor() {
    super({ message: 'Shift check out time limit exceeded' });
  }
}
