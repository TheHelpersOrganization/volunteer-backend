import { BaseApiException } from '@app/common/exceptions';

export class VolunteerStatusNotApprovedException extends BaseApiException {
  constructor() {
    super('Volunteer has not finished registration');
  }
}
