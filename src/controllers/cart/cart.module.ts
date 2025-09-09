import { Module } from '@nestjs/common';
import { AuthenticationServiceModule } from 'src/domain/service/authentication/authentication.service.module';

import { CartServiceModule } from './../../domain/service/cart/cart.service.module';
import { ProductServiceModule } from './../../domain/service/product/product.service.module';
import { CartController } from './cart.controller';
import { DeleteProductCartCommandHandler } from './command/delete-product-cart.command.handler';
import { EmptyCartCommandHandler } from './command/empty-cart.command.handler';
import { UpdateCartProductQuantityCommandHandler } from './command/update-product-quantity-in-cart.command.handler';
import { GetCartByIdQueryHandler } from './query/get-cart-by-id.query.handler';

const commandHandlers = [
  UpdateCartProductQuantityCommandHandler,
  DeleteProductCartCommandHandler,
  EmptyCartCommandHandler,
];

const queryHandlers = [GetCartByIdQueryHandler];

@Module({
  imports: [
    CartServiceModule,
    ProductServiceModule,
    AuthenticationServiceModule,
  ],
  controllers: [CartController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class CartModule {}
