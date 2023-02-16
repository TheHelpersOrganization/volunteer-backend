import { HttpException } from '@nestjs/common';

import { createExceptionErrorCode } from '../utils';

export class BaseApiException extends HttpException {
  public errorCode: string;
  public localizedMessage: Record<string, string>;
  public details: string | Record<string, any>;

  constructor(
    message: string,
    errorCode?: string,
    status?: number,
    details?: string | Record<string, any>,
    localizedMessage?: Record<string, string>,
  ) {
    // Calling parent constructor of base Exception class.
    super(message, status ?? 400);
    this.name = this.constructor.name;
    this.errorCode = errorCode ?? createExceptionErrorCode(this.name);
    this.localizedMessage = localizedMessage;
    this.details = details;
  }
}
