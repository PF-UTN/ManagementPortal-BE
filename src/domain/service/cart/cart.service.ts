import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  GetCartProductQuantityDto,
  ProductDetailsDto,
  UpdateCartProductQuantityDto,
} from '@mp/common/dtos';

import { ProductService } from '../product/product.service';
import { CartRepository } from './../../../../libs/repository/src/services/cart/cart.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductService,
  ) {}

  async saveProductToRedisAsync(product: ProductDetailsDto): Promise<void> {
    await this.cartRepository.saveProductToRedisAsync(product);
  }

  async getProductByIdFromRedisAsync(productId: number) {
    return this.cartRepository.getProductByIdFromRedisAsync(productId);
  }

  async updateProductQuantityInCartAsync(
    userId: number,
    updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ): Promise<void> {
    const { productId, quantity } = updateCartProductQuantityDto;

    const product = await this.productService.findProductByIdAsync(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!product.enabled) {
      throw new BadRequestException(
        `Product with ID ${productId} is not enabled`,
      );
    }

    const currentQuantityInCart =
      (await this.cartRepository.getProductQuantityFromCartAsync(userId, {
        productId,
      })) ?? 0;

    const totalRequestedQuantity = currentQuantityInCart + quantity;

    const finalQuantity =
      totalRequestedQuantity <= (product.stock?.quantityAvailable ?? 0)
        ? totalRequestedQuantity
        : (product.stock?.quantityAvailable ?? 0);

    if (finalQuantity === 0) {
      throw new BadRequestException(
        `No stock available for product ID ${productId}`,
      );
    }

    const updatedDto = {
      ...updateCartProductQuantityDto,
      quantity: finalQuantity,
    };

    await this.cartRepository.updateProductQuantityInCartAsync(
      userId,
      updatedDto,
    );
  }

  async getProductQuantityFromCartAsync(
    userId: number,
    getCartProductQuantityDto: GetCartProductQuantityDto,
  ): Promise<number | null> {
    return this.cartRepository.getProductQuantityFromCartAsync(
      userId,
      getCartProductQuantityDto,
    );
  }
}
