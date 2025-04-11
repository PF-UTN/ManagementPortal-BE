import { AuthGuard } from '@mp/common/guards';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export const AuthenticationConfiguration = (app: INestApplication) => {
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const configService = app.get(ConfigService);
  app.useGlobalGuards(new AuthGuard(jwtService, reflector, configService));
};
