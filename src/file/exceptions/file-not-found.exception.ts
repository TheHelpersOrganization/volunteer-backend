import { BaseApiException } from 'src/common/exceptions';

export class FileNotFoundException extends BaseApiException {
  constructor() {
    super('File not found');
  }
}
