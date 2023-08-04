import { BaseApiException } from '@app/common/exceptions';

export class VolunteerHasAlreadyJoinedShiftException extends BaseApiException {
  constructor() {
    super('Volunteer has already joined shift');
  }
}
