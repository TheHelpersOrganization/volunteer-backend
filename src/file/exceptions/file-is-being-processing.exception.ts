import { BaseApiException } from '@app/common/exceptions';

export class FileProcessingHasNotFinished extends BaseApiException {
  constructor() {
    super('File is being processed');
  }
}
