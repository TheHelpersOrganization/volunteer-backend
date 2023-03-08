import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { BaseApiResponse } from '../dtos';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<BaseApiResponse<any> | any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((res) => {
        if (res instanceof BaseApiResponse || res instanceof StreamableFile) {
          return res;
        }
        const size = Array.isArray(res) ? res.length : undefined;
        return {
          data: res ?? {},
          meta: {
            size,
          },
        };
      }),
    );
  }
}
