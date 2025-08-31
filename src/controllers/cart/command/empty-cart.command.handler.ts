import { CommandHandler } from '@nestjs/cqrs';

import { CartService } from './../../../domain/service/cart/cart.service';
import { EmptyCartCommand } from './empty-cart.command';

@CommandHandler(EmptyCartCommand)
export class EmptyCartCommandHandler {
  constructor(private readonly cartService: CartService) {}

  async execute(command: EmptyCartCommand) {
    await this.cartService.emptyCartAsync(command.cartId);
  }
}
