import { Module } from '@nestjs/common';

import { SearchProductQueryHandler } from './command/search-product-query.handler';
import { ProductController } from './product.controller';
import { ProductServiceModule } from '../../domain/service/product/product.service.module';

const queryHandlers = [
  SearchProductQueryHandler,
];
@Module({
  imports: [ProductServiceModule],
  controllers: [ProductController],
  providers: [...queryHandlers],
})
export class ProductModule {}