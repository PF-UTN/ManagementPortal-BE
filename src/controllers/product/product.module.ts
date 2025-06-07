import { Module } from '@nestjs/common';

import { SearchProductQueryHandler } from './command/search-product-query.handler';
import { ProductController } from './product.controller';
import { GetProductByIdQueryHandler } from './query/get-product-by-id.query.handler';
import { ProductServiceModule } from '../../domain/service/product/product.service.module';

const queryHandlers = [
  SearchProductQueryHandler,
  GetProductByIdQueryHandler,
];
@Module({
  imports: [ProductServiceModule],
  controllers: [ProductController],
  providers: [...queryHandlers],
})
export class ProductModule {}