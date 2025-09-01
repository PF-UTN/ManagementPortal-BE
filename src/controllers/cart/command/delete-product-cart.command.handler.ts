import { CommandHandler } from '@nestjs/cqrs';

import { CartService } from './../../../domain/service/cart/cart.service';
import { DeleteProductCartCommand } from './delete-product-cart.command';

@CommandHandler(DeleteProductCartCommand)
export class DeleteProductCartCommandHandler {
  constructor(private readonly cartService: CartService) {}

  async execute(command: DeleteProductCartCommand) {
    const { cartId, deleteProductFromCartDto } = command;

    return this.cartService.deleteProductFromCartAsync(
      cartId,
      deleteProductFromCartDto,
    );
  }
}
