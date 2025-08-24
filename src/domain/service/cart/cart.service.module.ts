import { forwardRef, Module } from '@nestjs/common';
import { CartRepository } from 'libs/repository/src/services/cart/cart.repository';

import { RedisServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { CartService } from './cart.service';
import { ProductServiceModule } from '../product/product.service.module';

@Module({
  imports: [
    RepositoryModule,
    RedisServiceModule,
    forwardRef(() => ProductServiceModule),
  ],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartServiceModule {}
