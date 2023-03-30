import { BaseApiException } from 'src/common/exceptions';

export class VolunteerHasAlreadyJoinedShiftException extends BaseApiException {
  constructor() {
    super('Volunteer has already joined shift');
  }
}
