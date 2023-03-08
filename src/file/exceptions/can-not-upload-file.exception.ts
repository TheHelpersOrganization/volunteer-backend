import { BaseApiException } from 'src/common/exceptions';

export class CanNotUploadFileException extends BaseApiException {
  constructor(err: any) {
    super('Can not upload file to server', undefined, 500, err);
  }
}
