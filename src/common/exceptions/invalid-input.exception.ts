import { BaseApiException } from './base-api.exception';

export class InvalidInputException extends BaseApiException {
  constructor(property: unknown, details?: string | Record<string, any>) {
    super(`The ${property} is invalid`, `invalid-${property}`, 400, details);
  }
}
