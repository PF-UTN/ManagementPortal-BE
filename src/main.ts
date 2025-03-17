import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfiguration } from './configuration';
import { GlobalExceptionFilterConfiguration } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  SwaggerConfiguration(app);
  GlobalExceptionFilterConfiguration(app);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
