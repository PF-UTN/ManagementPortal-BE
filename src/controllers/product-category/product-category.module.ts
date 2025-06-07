import { Module } from '@nestjs/common';

import { ProductCategoryController } from './product-category.controller';
import { ProductCategoriesQueryHandler } from './query/product-categories.query.handler';
import { ProductCategoryServiceModule } from '../../domain/service/product-category/product-category.module';

@Module({
  imports: [ProductCategoryServiceModule],
  controllers: [ProductCategoryController],
  providers: [ProductCategoriesQueryHandler],
})
export class ProductCategoryModule {}