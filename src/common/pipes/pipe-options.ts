import { ValidationError, ValidationPipeOptions } from '@nestjs/common';

import { InvalidInputException } from '../exceptions/invalid-input.exception';

export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const customErrors = errors.map((e) => e.property);
    return new InvalidInputException(customErrors);
  },
};
