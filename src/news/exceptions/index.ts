import { BaseApiException } from '@app/common/exceptions';
import { HttpStatus } from '@nestjs/common';

export class NewsNotFoundException extends BaseApiException {
  constructor() {
    super({
      message: 'News not found',
      status: HttpStatus.NOT_FOUND,
    });
  }
}
