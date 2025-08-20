import { Injectable } from '@nestjs/common';

import { ProductDetailsDto } from '@mp/common/dtos';
import { RedisService } from '@mp/common/services';

@Injectable()
export class CartRepository {
  constructor(private readonly redisService: RedisService) {}

  async saveProductToRedisAsync(product: ProductDetailsDto): Promise<void> {
    await this.redisService.setFieldInHash(
      'products',
      product.id.toString(),
      JSON.stringify(product),
    );
    await this.redisService.setKeyExpiration('products', 5400);
  }

  async getProductByIdFromRedisAsync(
    productId: number,
  ): Promise<ProductDetailsDto | null> {
    const productJson = await this.redisService.getFieldValue(
      'products',
      productId.toString(),
    );
    if (!productJson) return null;
    await this.redisService.setKeyExpiration('products', 5400);
    return JSON.parse(productJson) as ProductDetailsDto;
  }
}
