import { Injectable } from '@nestjs/common';

import {
  GetCartProductQuantityDto,
  UpdateCartProductQuantityDto,
} from '@mp/common/dtos';
import { RedisService } from '@mp/common/services';

@Injectable()
export class CartRepository {
  constructor(private readonly redisService: RedisService) {}

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
