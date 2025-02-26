import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfiguration } from './configuration';
import { GlobalExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  SwaggerConfiguration(app);
  app.useGlobalFilters(new GlobalExceptionFilter());
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
