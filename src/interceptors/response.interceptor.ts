// response.interceptor.ts

import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeneralResponse } from 'src/base-module/response-helper';
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        console.log( data);

        if (data !== undefined) {
          return new GeneralResponse({
            data: data.data,
            message: data.message,
            status: data.status,
          });
        }
        return data;
      }),
    );
  }
}
