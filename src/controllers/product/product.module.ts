import { Module } from '@nestjs/common';

import { CartServiceModule } from './../../domain/service/cart/cart.service.module';
import { CreateProductCommandHandler } from './command/create-product.command.handler';
import { DeleteProductCommandHandler } from './command/delete-product.command.handler';
import { SaveProductRedisCommand } from './command/save-product-redis.command';
import { SearchProductQueryHandler } from './command/search-product-query.handler';
import { UpdateEnabledProductCommandHandler } from './command/update-enabled-product.command.handler';
import { UpdateProductCommandHandler } from './command/update-product.command.handler';
import { ProductController } from './product.controller';
import { GetProductByIdQueryHandler } from './query/get-product-by-id.query.handler';
import { ProductServiceModule } from '../../domain/service/product/product.service.module';

const queryHandlers = [SearchProductQueryHandler, GetProductByIdQueryHandler];
const commandHandlers = [
  CreateProductCommandHandler,
  UpdateProductCommandHandler,
  UpdateEnabledProductCommandHandler,
  DeleteProductCommandHandler,
  SaveProductRedisCommand,
];

@Module({
  imports: [ProductServiceModule, CartServiceModule],
  exports: [ProductServiceModule],
  controllers: [ProductController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class ProductModule {}
