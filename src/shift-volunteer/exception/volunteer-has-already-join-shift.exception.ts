import { BaseApiException } from '@app/common/exceptions';

export class VolunteerHasAlreadyJoinedShiftException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer has already joined shift' });
  }
}
