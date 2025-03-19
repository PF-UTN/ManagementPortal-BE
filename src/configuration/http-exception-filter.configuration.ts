import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
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

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : new InternalServerErrorException().getStatus();

    response.status(status).json({
      statusCode: status,
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      path: request.url,
      stack:
        process.env.NODE_ENV === 'development'
          ? (exception as Error).stack
          : undefined,
    });
  }
}
