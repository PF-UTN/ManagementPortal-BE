import { INestApplication, ValidationPipe } from '@nestjs/common';

export const GlobalPipesConfiguration = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
};
