import { BaseApiException } from '@app/common/exceptions';

export class FileNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'File not found', status: 404 });
  }
}
