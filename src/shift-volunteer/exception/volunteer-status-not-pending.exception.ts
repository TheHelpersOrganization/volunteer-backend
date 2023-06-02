import { BaseApiException } from 'src/common/exceptions';

export class VolunteerStatusNotPendingException extends BaseApiException {
  constructor() {
    super('Volunteer has finished registration');
  }
}
