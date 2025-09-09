import { QueryHandler } from '@nestjs/cqrs';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { CartService } from './../../../domain/service/cart/cart.service';
import { GetCartByIdQuery } from './get-cart-by-id.query';

@QueryHandler(GetCartByIdQuery)
export class GetCartByIdQueryHandler {
  constructor(
    private readonly cartService: CartService,
    private readonly authenticationService: AuthenticationService,
  ) {}
  async execute(query: GetCartByIdQuery) {
    const token = query.authorizationHeader.split(' ')[1];
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const cartId = payload.sub;

    return await this.cartService.getCartAsync(cartId);
  }
}
