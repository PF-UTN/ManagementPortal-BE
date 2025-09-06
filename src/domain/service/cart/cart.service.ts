import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CartDto,
  CartItemDto,
  DeleteProductFromCartDto,
} from '@mp/common/dtos';
import {
  GetCartProductQuantityDto,
  UpdateCartProductQuantityDto,
} from '@mp/common/dtos';

import { AuthenticationService } from '../authentication/authentication.service';
import { ProductService } from '../product/product.service';
import { CartRepository } from './../../../../libs/repository/src/services/cart/cart.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async updateProductQuantityInCartAsync(
    token: string,
    updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ): Promise<void> {
    const { productId, quantity } = updateCartProductQuantityDto;

    const payload = await this.authenticationService.decodeTokenAsync(token);
    const cartId = payload.sub;

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
      (await this.cartRepository.getProductQuantityFromCartAsync(cartId, {
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
      cartId,
      updatedDto,
    );
  }

  async getProductQuantityFromCartAsync(
    token: string,
    getCartProductQuantityDto: GetCartProductQuantityDto,
  ): Promise<number | null> {
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const cartId = payload.sub;
    return this.cartRepository.getProductQuantityFromCartAsync(
      cartId,
      getCartProductQuantityDto,
    );
  }

  async deleteProductFromCartAsync(
    token: string,
    deleteProductFromCartDto: DeleteProductFromCartDto,
  ): Promise<void> {
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const cartId = payload.sub;
    const exist = await this.cartRepository.existProductInCartAsync(
      cartId,
      deleteProductFromCartDto.productId,
    );
    if (!exist) {
      throw new NotFoundException(
        `Product with ID ${deleteProductFromCartDto.productId} not found in cart`,
      );
    }
    await this.cartRepository.deleteProductFromCartAsync(
      cartId,
      deleteProductFromCartDto,
    );
  }
  async emptyCartAsync(token: string): Promise<void> {
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const cartId = payload.sub;
    await this.cartRepository.emptyCartAsync(cartId);
  }

  async getCartAsync(token: string): Promise<CartDto> {
    const payload = await this.authenticationService.decodeTokenAsync(token);

    const cartId = payload.sub;

    const cartInRedis = await this.cartRepository.getCartAsync(cartId);

    if (!cartInRedis || cartInRedis.items.length === 0) {
      return {
        cartId: cartId.toString(),
        items: [],
      };
    }
    const items: CartItemDto[] = [];

    for (const cartItem of cartInRedis.items) {
      try {
        const product = await this.productService.findProductByIdAsync(
          cartItem.productId,
        );
        items.push({ product, quantity: cartItem.quantity });
      } catch {
        continue;
      }
    }
    const cart: CartDto = {
      cartId: cartId.toString(),
      items,
    };
    return cart;
  }
}
