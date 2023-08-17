import { BaseApiException } from '@app/common/exceptions';
import { getHumanReadableFileSize } from '@app/common/utils';

export class FileTooLargeException extends BaseApiException {
  constructor(fileSize: number, maxFileSize: string) {
    super({
      message: `Max allowed file size is ${maxFileSize}, current file size is ${getHumanReadableFileSize(
        fileSize,
      )}`,
    });
  }
}
