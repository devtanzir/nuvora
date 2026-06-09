import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // If the controller returned an object with 'message' and 'data', unwrap and build standard
        if (response && typeof response === 'object' && 'data' in response) {
          const { data, message, ...rest } = response as any;
          return {
            success: true,
            message: message || 'Success',
            data: data ?? rest,
            timestamp: new Date().toISOString(),
          };
        }

        // If controller returned just a primitive or an array, wrap it as data
        return {
          success: true,
          message: 'Success',
          data: response,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
