import { Injectable } from '@nestjs/common';

import { ProductDetailsDto } from '@mp/common/dtos';

import { CartRepository } from './../../../../libs/repository/src/services/cart/cart.repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async saveProductToRedisAsync(product: ProductDetailsDto): Promise<void> {
    await this.cartRepository.saveProductToRedisAsync(product);
  }

  async getProductByIdFromRedisAsync(productId: number) {
    return this.cartRepository.getProductByIdFromRedisAsync(productId);
  }

  async updateProductQuantityInCartAsync(
    userId: string,
    productId: number,
    quantity: number,
  ): Promise<void> {
    await this.cartRepository.updateProductQuantityInCartAsync(
      userId,
      productId,
      quantity,
    );
  }

  async getProductQuantityFromCartAsync(
    userId: string,
    productId: number,
  ): Promise<number | null> {
    return this.cartRepository.getProductQuantityFromCartAsync(
      userId,
      productId,
    );
  }
}
