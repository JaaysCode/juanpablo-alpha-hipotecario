import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const start = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`← ${method} ${url} ${res.statusCode} (+${ms}ms)`);
      }),
      catchError((err: unknown) => {
        const ms = Date.now() - start;
        const status: number =
          (err as { status?: number; statusCode?: number })?.status ??
          (err as { status?: number; statusCode?: number })?.statusCode ??
          500;
        const message: string =
          (err as { message?: string })?.message ?? 'Internal error';
        this.logger.error(`← ${method} ${url} ${status} (+${ms}ms) — ${message}`);
        return throwError(() => err);
      }),
    );
  }
}
