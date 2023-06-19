import { BaseApiException } from 'src/common/exceptions';

export class ActivityNotFoundException extends BaseApiException {
  constructor() {
    super('Activity not found', undefined, 404);
  }
}
