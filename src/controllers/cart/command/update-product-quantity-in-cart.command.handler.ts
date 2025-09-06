import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CartService } from './../../../domain/service/cart/cart.service';
import { UpdateCartProductQuantityCommand } from './update-product-quantity-in-cart.command';

@CommandHandler(UpdateCartProductQuantityCommand)
export class UpdateCartProductQuantityCommandHandler
  implements ICommandHandler<UpdateCartProductQuantityCommand>
{
  constructor(private readonly cartService: CartService) {}

  async execute(command: UpdateCartProductQuantityCommand): Promise<void> {
    if (command.updateCartProductQuantityDto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (!command.updateCartProductQuantityDto?.productId) {
      throw new BadRequestException('productId is required');
    }
    const token = command.authorizationHeader.split(' ')[1];
    await this.cartService.updateProductQuantityInCartAsync(
      token,
      command.updateCartProductQuantityDto,
    );
  }
}
