import { Module } from '@nestjs/common';
import { CartRepository } from 'libs/repository/src/services/cart/cart.repository';

import { RedisServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { CartService } from './cart.service';
import { AuthenticationServiceModule } from '../authentication/authentication.service.module';
import { ProductServiceModule } from '../product/product.service.module';

@Module({
  imports: [
    RepositoryModule,
    RedisServiceModule,
    ProductServiceModule,
    AuthenticationServiceModule,
  ],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartServiceModule {}
