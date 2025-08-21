import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CartService } from './../../../domain/service/cart/cart.service';
import { ProductService } from './../../../domain/service/product/product.service';
import { UpdateCartProductQuantityCommand } from './update-product-quantity-in-cart.command';

@CommandHandler(UpdateCartProductQuantityCommand)
export class UpdateCartProductQuantityCommandHandler
  implements ICommandHandler<UpdateCartProductQuantityCommand>
{
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  async execute(command: UpdateCartProductQuantityCommand): Promise<number> {
    const { userId, productId, quantity } = command;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

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
      (await this.cartService.getProductQuantityFromCartAsync(
        userId,
        productId,
      )) ?? 0;

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

    await this.cartService.updateProductQuantityInCartAsync(
      userId,
      productId,
      finalQuantity,
    );

    return finalQuantity;
  }
}
