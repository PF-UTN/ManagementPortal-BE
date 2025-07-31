import { Injectable } from '@nestjs/common';

import { ProductDetailsDto } from '@mp/common/dtos';

import { CartRepository } from './../../../../libs/repository/src/services/cart/cart.repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async saveProductToRedisAsync(product: ProductDetailsDto): Promise<void> {
    await this.cartRepository.saveProductToRedisAsync(product);
  }
}
