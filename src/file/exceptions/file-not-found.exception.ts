import { BaseApiException } from '@app/common/exceptions';

export class FileNotFoundException extends BaseApiException {
  constructor() {
    super('File not found', undefined, 404);
  }
}
