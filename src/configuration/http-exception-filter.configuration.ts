import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  INestApplication,
} from '@nestjs/common';
import { Request, Response } from 'express';

export const GlobalExceptionFilterConfiguration = (app: INestApplication) => {
  app.useGlobalFilters(new GlobalExceptionFilter());
};
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      response.status(status).json({
        statusCode: status,
        ...(typeof errorResponse === 'object'
          ? errorResponse
          : { message: errorResponse }),
        timestamp: new Date().toISOString(),
        path: request.url,
      });

      return;
    }

    response.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      stack:
        process.env.NODE_ENV === 'development'
          ? (exception as Error).stack
          : undefined,
    });
  }
}
