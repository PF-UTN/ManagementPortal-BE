import { CommandHandler } from '@nestjs/cqrs';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { CartService } from './../../../domain/service/cart/cart.service';
import { EmptyCartCommand } from './empty-cart.command';

@CommandHandler(EmptyCartCommand)
export class EmptyCartCommandHandler {
  constructor(
    private readonly cartService: CartService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: EmptyCartCommand) {
    const token = command.authorizationHeader.split(' ')[1];
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const cartId = payload.sub;
    await this.cartService.emptyCartAsync(cartId);
  }
}
