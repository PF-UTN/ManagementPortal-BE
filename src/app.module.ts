import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthenticationModule } from './controllers/authentication/authentication.module';
import { RegistrationRequestModule } from './controllers/registration-request/registration-request.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.env`,
    }),
    AuthenticationModule,
    RegistrationRequestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
