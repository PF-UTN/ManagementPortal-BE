import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfiguration } from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  SwaggerConfiguration(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
