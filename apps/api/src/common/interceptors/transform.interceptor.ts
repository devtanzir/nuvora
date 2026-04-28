import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.CLOUDINARY_BASE_URL ||
      `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transformUrls(data)),
    );
  }

  private transformUrls(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transformUrls(item));
    }

    if (typeof data === 'object') {
      const transformed = { ...data };

      // Image URL fields auto-detect
      const imageFields = ['url', 'avatar', 'imageUrl', 'primaryImage'];

      for (const key of Object.keys(transformed)) {
        if (
          imageFields.includes(key) &&
          typeof transformed[key] === 'string' &&
          !transformed[key].startsWith('http')
        ) {
          transformed[key] = `${this.baseUrl}/${transformed[key]}`;
        } else if (typeof transformed[key] === 'object') {
          transformed[key] = this.transformUrls(transformed[key]);
        }
      }

      return transformed;
    }

    return data;
  }
}
