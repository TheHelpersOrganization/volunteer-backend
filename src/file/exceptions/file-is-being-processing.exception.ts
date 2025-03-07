import { BaseApiException } from '@app/common/exceptions';

export class FileProcessingHasNotFinished extends BaseApiException {
  constructor() {
    super({ message: 'File is being processed' });
  }
}
