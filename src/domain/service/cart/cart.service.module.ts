import { Module } from '@nestjs/common';
import { CartRepository } from 'libs/repository/src/services/cart/cart.repository';

import { RepositoryModule } from '@mp/repository';

import { CartService } from './cart.service';
import { RedisModule } from '../../../../libs/common/src/services/redis/redis.service.module';

@Module({
  imports: [RepositoryModule, RedisModule],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartServiceModule {}
