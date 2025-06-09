import { Module } from '@nestjs/common';

import { CreateProductCommandHandler } from './command/create-product.command.handler';
import { SearchProductQueryHandler } from './command/search-product-query.handler';
import { ProductController } from './product.controller';
import { ProductServiceModule } from '../../domain/service/product/product.service.module';

const queryHandlers = [
  SearchProductQueryHandler,
];
const commandHandlers = [CreateProductCommandHandler];

@Module({
  imports: [ProductServiceModule],
  controllers: [ProductController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class ProductModule {}