import { QueryHandler } from '@nestjs/cqrs';

import { CartService } from './../../../domain/service/cart/cart.service';
import { GetCartByIdQuery } from './get-cart-by-id.query';

@QueryHandler(GetCartByIdQuery)
export class GetCartByIdQueryHandler {
  constructor(private readonly cartService: CartService) {}
  async execute(query: GetCartByIdQuery) {
    const token = query.authorizationHeader.split(' ')[1];

    return await this.cartService.getCartAsync(token);
  }
}
