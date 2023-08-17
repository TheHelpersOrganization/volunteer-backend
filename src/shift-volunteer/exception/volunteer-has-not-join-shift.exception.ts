import { BaseApiException } from '@app/common/exceptions';

export class VolunteerHasNotJoinedShiftException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer has not joined any shift' });
  }
}
