import { Injectable } from '@nestjs/common';

import { ProductDetailsDto } from '@mp/common/dtos';

import { RedisService } from './../../../../../src/redis/redis.service';

@Injectable()
export class CartRepository {
  constructor(
    private readonly redisService: RedisService,
  ) {}

  async saveProductToRedisAsync(product: ProductDetailsDto): Promise<void> {
    const productFields: Record<string, string | number> = {
      name: product.name,
      enabled: product.enabled ? 'true' : 'false',
      stock: product.stock.quantityAvailable,
      price: product.price,
    }
    await this.redisService.setMultipleFieldsInHash(`product:${product.id}`, productFields);
  }
}
