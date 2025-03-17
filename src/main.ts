import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<<<<<<< HEAD
<<<<<<< HEAD
import { GlobalExceptionFilter } from './http-exception.filter';
=======
import { SwaggerConfiguration } from './configuration';
>>>>>>> 5665755cd40cb148598f4f0e21a61a27e028aa9d
=======
import { SwaggerConfiguration } from './configuration';
import { GlobalExceptionFilter } from './http-exception.filter';
>>>>>>> 6f24ea35f5fddb461590524a1597ff8a333db0ae

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

<<<<<<< HEAD
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
=======
  SwaggerConfiguration(app);
  app.useGlobalFilters(new GlobalExceptionFilter());
>>>>>>> 6f24ea35f5fddb461590524a1597ff8a333db0ae
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
