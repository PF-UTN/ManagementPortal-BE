import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthenticationModule } from './controllers/authentication/authentication.module';
import { ProductModule } from './controllers/product/product.module';
import { ProductCategoryModule } from './controllers/product-category/product-category.module';
import { PurchaseOrderModule } from './controllers/purchase-order/purchase-order.controller.module';
import { RegistrationRequestModule } from './controllers/registration-request/registration-request.module';
import { SupplierModule } from './controllers/supplier/supplier.controller.module';
import { TownModule } from './controllers/town/town.controller.module';
import { VehicleModule } from './controllers/vehicle/vehicle.controller.module';

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
    ProductCategoryModule,
    SupplierModule,
    VehicleModule,
    PurchaseOrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
