import { BaseApiException } from 'src/common/exceptions';

export class VolunteerStatusNotApprovedException extends BaseApiException {
  constructor() {
    super('Volunteer has not finished registration');
  }
}
