import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';
import {
  GlobalExceptionFilterConfiguration,
  SwaggerConfiguration,
  GlobalPipesConfiguration,
} from './configuration';
import { AuthenticationConfiguration } from './configuration/authentication.configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Disposition'],
  });

  app.useStaticAssets(join(process.cwd(), 'public'));

  AuthenticationConfiguration(app);
  SwaggerConfiguration(app);
  GlobalExceptionFilterConfiguration(app);
  GlobalPipesConfiguration(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
