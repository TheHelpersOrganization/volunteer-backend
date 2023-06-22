import { BaseApiException } from 'src/common/exceptions';

export * from './volunteer-has-already-join-shift.exception';
export * from './volunteer-has-not-join-shift.exception';
export * from './volunteer-status-not-approved.exception';
export * from './volunteer-status-not-pending.exception';

export class VolunteerNotFoundException extends BaseApiException {
  constructor() {
    super('Volunteer not found', undefined, 404);
  }
}

export class VolunteerHasAlreadyCheckedInException extends BaseApiException {
  constructor() {
    super('Volunteer has already checked in');
  }
}

export class VolunteerHasNotCheckedInException extends BaseApiException {
  constructor() {
    super('Volunteer has not checked in');
  }
}

export class VolunteerHasAlreadyCheckedOutException extends BaseApiException {
  constructor() {
    super('Volunteer has already checked out');
  }
}
