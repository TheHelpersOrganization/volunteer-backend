import { BaseApiException } from 'src/common/exceptions';

export class VolunteerHasNotJoinedShiftException extends BaseApiException {
  constructor() {
    super('Volunteer has not joined any shift');
  }
}
