import { Module } from '@nestjs/common';

import { ProductCategoryController } from './product-category.controller';
import { GetProductCategoriesQueryHandler } from './query/get-product-categories.query.handler';
import { ProductCategoryServiceModule } from '../../domain/service/product-category/product-category.module';

@Module({
  imports: [ProductCategoryServiceModule],
  controllers: [ProductCategoryController],
  providers: [GetProductCategoriesQueryHandler],
})
export class ProductCategoryModule {}