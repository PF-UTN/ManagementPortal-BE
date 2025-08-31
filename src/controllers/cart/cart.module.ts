import { Module } from '@nestjs/common';

import { CartServiceModule } from './../../domain/service/cart/cart.service.module';
import { ProductServiceModule } from './../../domain/service/product/product.service.module';
import { CartController } from './cart.controller';
import { DeleteProductCartCommandHandler } from './command/delete-product-cart.command.handler';
import { EmptyCartCommandHandler } from './command/empty-cart.command.handler';
import { UpdateCartProductQuantityCommandHandler } from './command/update-product-quantity-in-cart.command.handler';

const commandHandlers = [
  UpdateCartProductQuantityCommandHandler,
  DeleteProductCartCommandHandler,
  EmptyCartCommandHandler,
];

@Module({
  imports: [CartServiceModule, ProductServiceModule],
  controllers: [CartController],
  providers: [...commandHandlers],
})
export class CartModule {}
