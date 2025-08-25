import { Injectable } from '@nestjs/common';

import {
  GetCartProductQuantityDto,
  ProductDetailsDto,
  UpdateCartProductQuantityDto,
} from '@mp/common/dtos';
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

  async updateProductQuantityInCartAsync(
    cartId: number,
    updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ): Promise<void> {
    const { productId, quantity } = updateCartProductQuantityDto;
    const cartKey = `cart:${cartId}`;
    await this.redisService.setFieldInHash(
      cartKey,
      productId.toString(),
      quantity.toString(),
    );
    await this.redisService.setKeyExpiration(cartKey, 5400);
  }

  async getProductQuantityFromCartAsync(
    cartId: number,
    getCartProductQuantityDto: GetCartProductQuantityDto,
  ): Promise<number | null> {
    const { productId } = getCartProductQuantityDto;
    const cartKey = `cart:${cartId}`;
    const value = await this.redisService.getFieldValue(
      cartKey,
      productId.toString(),
    );
    await this.redisService.setKeyExpiration(cartKey, 5400);
    return value ? parseInt(value, 10) : null;
  }
}
