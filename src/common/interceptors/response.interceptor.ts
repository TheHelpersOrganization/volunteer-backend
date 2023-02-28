import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { BaseApiResponse } from '../dtos';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<BaseApiResponse<any> | any>,
  ):
    | Observable<BaseApiResponse<any>>
    | Promise<Observable<BaseApiResponse<any>>> {
    return next.handle().pipe(
      map((res) => {
        if (res instanceof BaseApiResponse) {
          return res;
        }
        return {
          data: res.data,
          meta: {},
        };
      }),
    );
  }
}
