import { BaseApiException } from '@app/common/exceptions';

export class VolunteerStatusNotPendingException extends BaseApiException {
  constructor() {
    super({ message: 'Volunteer has finished registration' });
  }
}
