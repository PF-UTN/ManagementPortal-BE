import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthenticationModule } from './controllers/authentication/authentication.module';
import { RegistrationRequestModule } from './controllers/registration-request/registration-request.module';
import { CountryModule } from './controllers/country/country.module';
import { ProvinceModule } from './controllers/province/province.module';
@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.env`,
    }),
    AuthenticationModule,
    RegistrationRequestModule,
    CountryModule,
    ProvinceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
