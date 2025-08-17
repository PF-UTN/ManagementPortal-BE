import { Module } from '@nestjs/common';
import { CartServiceModule } from "src/domain/service/cart/cart.service.module";
import { ProductServiceModule } from 'src/domain/service/product/product.service.module';

import { CartController } from "./cart.controller";
import { SaveProductRedisCommandHandler } from "./command/save-product-redis.command.handler";
import { GetProductByIdRedisQueryHandler } from './query/get-product-by-id-redis.query.handler';

const commandHandlers = [
  SaveProductRedisCommandHandler,
];

const queryHandler = [
  GetProductByIdRedisQueryHandler,
]

@Module({
    imports: [CartServiceModule, ProductServiceModule],
    controllers: [CartController],
    providers: [...commandHandlers, ...queryHandler],
})
export class CartModule {}