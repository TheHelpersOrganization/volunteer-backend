import { BaseApiException } from 'src/common/exceptions';

export class FileProcessingHasNotFinished extends BaseApiException {
  constructor() {
    super('File is being processed');
  }
}
