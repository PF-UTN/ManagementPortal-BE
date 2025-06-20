import { Module } from '@nestjs/common';

import { CreateProductCategoryCommandHandler } from './command/create-product-category.command.handler';
import { ProductCategoryController } from './product-category.controller';
import { ProductCategoriesQueryHandler } from './query/product-categories.query.handler';
import { ProductCategoryServiceModule } from '../../domain/service/product-category/product-category.module';

const queryHandlers = [ProductCategoriesQueryHandler];
const commandHandlers = [CreateProductCategoryCommandHandler];

@Module({
  imports: [ProductCategoryServiceModule],
  controllers: [ProductCategoryController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class ProductCategoryModule {}
