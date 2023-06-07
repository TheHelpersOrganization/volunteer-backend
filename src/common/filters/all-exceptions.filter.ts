import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

import { Environment, REQUEST_ID_TOKEN_HEADER } from '../constants';
import { BaseApiException } from '../exceptions/base-api.exception';
import { AppLogger } from '../logger/logger.service';
import { createRequestContext } from '../request-context/util';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  /** set logger context */
  constructor(
    private config: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: T, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest<Request>();
    const res: Response = ctx.getResponse<Response>();

    const path = req.url;
    const timestamp = new Date().toISOString();
    const requestId = req.headers[REQUEST_ID_TOKEN_HEADER];
    const requestContext = createRequestContext(req);

    let stack: any;
    let statusCode: HttpStatus | null = null;
    let errorName: string | null = null;
    let errorCode: string | null = null;
    let message: string | null = null;
    let details: string | Record<string, any> | null = null;
    // TODO : Based on language value in header, return a localized message.
    const acceptedLanguage = 'ja';
    let localizedMessage: string | undefined = undefined;

    // TODO : Refactor the below cases into a switch case and tidy up error response creation.
    if (exception instanceof BaseApiException) {
      statusCode = exception.getStatus();
      errorName = exception.constructor.name;
      errorCode = exception.errorCode;
      message = exception.message;
      localizedMessage = exception.localizedMessage?.[acceptedLanguage];
      details = exception.details || exception.getResponse();
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorName = exception.constructor.name;
      message = exception.message;
      details = exception.getResponse();
      stack = exception.stack;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      console.log(exception.code);
      console.log(exception.message);
      errorName = 'DatabaseException';
      errorCode = 'database-exception';
      if (exception.code.startsWith('P1')) {
        statusCode = 500;
        message = 'Connection error';
      } else if (exception.code === 'P2015' || exception.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
      } else if (exception.code.startsWith('P2')) {
        statusCode = 400;
        message = 'Input constraint/validation failed';
      } else {
        statusCode = 500;
        message = 'Unknown error';
      }
      stack = exception.stack;
    } else if (exception instanceof PrismaClientValidationError) {
      errorName = 'DatabaseException';
      errorCode = 'database-exception';
      statusCode = 400;
      message = 'Input constraint/validation failed';
      stack = exception.stack;
    } else if (exception instanceof Error) {
      errorName = exception.constructor.name;
      message = exception.message;
      stack = exception.stack;
    }

    // Set to internal server error in case it did not match above categories.
    statusCode = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    errorName = errorName || 'InternalException';
    message = message || 'Internal server error';

    // NOTE: For reference, please check https://cloud.google.com/apis/design/errors
    const error = {
      statusCode,
      message,
      localizedMessage,
      errorName,
      errorCode,
      details,
      // Additional meta added by us.
      path,
      requestId,
      timestamp,
    };
    this.logger.warn(requestContext, error.message, {
      error,
      stack,
    });

    // Suppress original internal server error details in prod mode
    const isProMood =
      this.config.get<string>('app.env') !== Environment.Development;
    if (isProMood && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      error.message = 'Internal server error';
    }

    res.status(statusCode).json({ error });
  }
}
