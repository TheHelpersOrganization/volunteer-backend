import { BaseApiException } from '@app/common/exceptions';

export * from './volunteer-has-already-join-shift.exception';
export * from './volunteer-has-not-join-shift.exception';
export * from './volunteer-status-not-approved.exception';
export * from './volunteer-status-not-pending.exception';

export class VolunteerNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer not found', status: 404 });
  }
}

export class VolunteerHasAlreadyCheckedInException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer has already checked in' });
  }
}

export class VolunteerHasNotCheckedInException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer has not checked in' });
  }
}

export class VolunteerHasAlreadyCheckedOutException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer has already checked out' });
  }
}

export class CheckInHasAlreadyBeenVerified extends BaseApiException {
  constructor() {
    super({ message: 'Check in has already been verified' });
  }
}

export class CheckOutHasAlreadyBeenVerified extends BaseApiException {
  constructor() {
    super({ message: 'Check out has already been verified' });
  }
}
