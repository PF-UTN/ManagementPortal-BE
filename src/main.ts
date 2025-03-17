import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { GlobalExceptionFilter } from './http-exception.filter';
=======
import { SwaggerConfiguration } from './configuration';
>>>>>>> 5665755cd40cb148598f4f0e21a61a27e028aa9d

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

<<<<<<< HEAD
  const config = new DocumentBuilder()
    .setTitle('Management Portal API')
    .setDescription('API documentation for the Management Portal')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('index', app, document);
  app.useGlobalFilters(new GlobalExceptionFilter());
=======
  SwaggerConfiguration(app);

>>>>>>> 5665755cd40cb148598f4f0e21a61a27e028aa9d
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
