import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthenticationModule } from './controllers/authentication/authentication.module';
import { ProductModule } from './controllers/product/product.module';
import { RegistrationRequestModule } from './controllers/registration-request/registration-request.module';
import { SupplierModule } from './controllers/supplier/supplier.controller.module';
import { TownModule } from './controllers/town/town.controller.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.env`,
    }),
    AuthenticationModule,
    RegistrationRequestModule,
    TownModule,
    ProductModule,
    SupplierModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
