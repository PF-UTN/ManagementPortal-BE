import { Module } from '@nestjs/common';

import { CartServiceModule } from './../../domain/service/cart/cart.service.module';
import { AdjustProductStockCommandHandler } from './command/adjust-product-stock.command.handler';
import { CreateProductCommandHandler } from './command/create-product.command.handler';
import { DeleteProductCommandHandler } from './command/delete-product.command.handler';
import { SearchProductQueryHandler } from './command/search-product-query.handler';
import { UpdateEnabledProductCommandHandler } from './command/update-enabled-product.command.handler';
import { UpdateProductCommandHandler } from './command/update-product.command.handler';
import { ProductController } from './product.controller';
import { GetProductByIdQueryHandler } from './query/get-product-by-id.query.handler';
import { ProductServiceModule } from '../../domain/service/product/product.service.module';
import { StockServiceModule } from '../../domain/service/stock/stock.service.module';

const queryHandlers = [SearchProductQueryHandler, GetProductByIdQueryHandler];
const commandHandlers = [
  CreateProductCommandHandler,
  UpdateProductCommandHandler,
  UpdateEnabledProductCommandHandler,
  DeleteProductCommandHandler,
  AdjustProductStockCommandHandler,
];

@Module({
  imports: [ProductServiceModule, CartServiceModule, StockServiceModule],
  exports: [ProductServiceModule],
  controllers: [ProductController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class ProductModule {}
