import { BaseApiException } from '@app/common/exceptions';

export class VolunteerStatusNotApprovedException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer has not finished registration' });
  }
}
