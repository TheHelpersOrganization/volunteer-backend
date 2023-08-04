import { BaseApiException } from '@app/common/exceptions';

export class VolunteerStatusNotPendingException extends BaseApiException {
  constructor() {
    super('Volunteer has finished registration');
  }
}
