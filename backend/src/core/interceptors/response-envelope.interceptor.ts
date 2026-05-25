import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
  trace_id?: string;
}

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T>> {
    const request = context.switchToHttp().getRequest();
    const traceId = request['traceId'] || '';

    return next.handle().pipe(
      map((data) => {
        // If already enveloped, pass through
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data
        ) {
          if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
          }
          if (traceId && !data.trace_id) {
            data.trace_id = traceId;
          }
          return data;
        }

        // If it's a raw array, wrap it
        const payload: ResponseEnvelope<T> = {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };

        if (traceId) {
          payload.trace_id = traceId;
        }

        // If data contains meta (e.g., from repository), lift it
        if (
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'meta' in data &&
          'data' in data
        ) {
          payload.data = data.data;
          payload.meta = data.meta;
        }

        return payload;
      }),
    );
  }
}
