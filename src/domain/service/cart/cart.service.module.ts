import { Module } from '@nestjs/common';
import { CartRepository } from 'libs/repository/src/services/cart/cart.repository';

import { RedisServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { CartService } from './cart.service';

@Module({
  imports: [RepositoryModule, RedisServiceModule],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartServiceModule {}
