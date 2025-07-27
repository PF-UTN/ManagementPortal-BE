import { Module } from '@nestjs/common';
import { CartRepository } from 'libs/repository/src/services/cart/cart.repository';

import { RepositoryModule } from '@mp/repository';

import { RedisModule } from './../../../redis/redis.service.module';
import { CartService } from './cart.service';

@Module({
  imports: [RepositoryModule, RedisModule],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartServiceModule {}
