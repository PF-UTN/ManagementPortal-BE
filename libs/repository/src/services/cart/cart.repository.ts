import { Injectable } from '@nestjs/common';

import {
  GetCartProductQuantityDto,
  UpdateCartProductQuantityDto,
  DeleteProductFromCartDto,
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

  async existProductInCartAsync(
    cartId: number,
    productId: number,
  ): Promise<boolean> {
    const cartKey = `cart:${cartId}`;
    return this.redisService.fieldExistsInObject(cartKey, productId.toString());
  }

  async deleteProductFromCartAsync(
    cartId: number,
    deleteProductFromCartDto: DeleteProductFromCartDto,
  ): Promise<void> {
    const { productId } = deleteProductFromCartDto;
    const cartKey = `cart:${cartId}`;
    await this.redisService.removeFieldFromObject(
      cartKey,
      productId.toString(),
    );
  }
}
