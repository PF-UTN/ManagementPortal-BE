import { Injectable } from '@nestjs/common';

import { ProductDetailsDto } from '@mp/common/dtos';
import { RedisService } from '@mp/common/services';

@Injectable()
export class CartRepository {
  constructor(private readonly redisService: RedisService) {}

  async saveProductToRedisAsync(product: ProductDetailsDto): Promise<void> {
    const productData = {
      name: product.name,
      enabled: product.enabled,
      stock: product.stock.quantityAvailable,
      price: product.price,
    };

    await this.redisService.setFieldInHash(
      'products', 
      product.id.toString(),
      JSON.stringify(productData), 
    );
    await this.redisService.setKeyExpiration('products', 5400); 
  }
}
