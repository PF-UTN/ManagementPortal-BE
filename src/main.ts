import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Management Portal API')
    .setDescription('API documentation for the Management Portal')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('index', app, document);
  app.useGlobalFilters(new GlobalExceptionFilter());
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
