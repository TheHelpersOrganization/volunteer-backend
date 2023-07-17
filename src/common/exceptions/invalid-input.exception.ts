import { BaseApiException } from './base-api.exception';

export class InvalidInputException extends BaseApiException {
  constructor(property: unknown, details?: string | Record<string, any>) {
    super(`The ${property} is invalid`, `invalid-${property}`, 400, details);
  }
}

export class InvalidCursorException extends BaseApiException {
  constructor() {
    super(
      'Cannot use cursor and offset at the same time',
      'invalid-cursor',
      400,
    );
  }
}
