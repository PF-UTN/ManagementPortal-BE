import { CommandHandler } from '@nestjs/cqrs';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { CartService } from './../../../domain/service/cart/cart.service';
import { DeleteProductCartCommand } from './delete-product-cart.command';

@CommandHandler(DeleteProductCartCommand)
export class DeleteProductCartCommandHandler {
  constructor(
    private readonly cartService: CartService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: DeleteProductCartCommand) {
    const { authorizationHeader, deleteProductFromCartDto } = command;

    const token = authorizationHeader.split(' ')[1];

    const payload = await this.authenticationService.decodeTokenAsync(token);
    const cartId = payload.sub;

    return this.cartService.deleteProductFromCartAsync(
      cartId,
      deleteProductFromCartDto,
    );
  }
}
