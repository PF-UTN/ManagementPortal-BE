import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
import {
  GlobalExceptionFilterConfiguration,
  SwaggerConfiguration,
  GlobalPipesConfiguration,
  IngestConfiguration,
} from './configuration';
import { AuthenticationConfiguration } from './configuration/authentication.configuration';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Disposition'],
  });

  AuthenticationConfiguration(app);
  SwaggerConfiguration(app);
  GlobalExceptionFilterConfiguration(app);
  GlobalPipesConfiguration(app);
  IngestConfiguration(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
