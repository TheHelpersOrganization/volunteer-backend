import { BaseApiException } from '@app/common/exceptions';

export class ActivityNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Activity not found', status: 404 });
  }
}
