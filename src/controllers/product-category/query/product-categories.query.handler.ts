import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductCategoriesQuery } from './product-categories.query';
import { ProductCategoryService } from '../../../domain/service/product-category/product-category.service';

@QueryHandler(ProductCategoriesQuery)
export class ProductCategoriesQueryHandler implements IQueryHandler<ProductCategoriesQuery> {
  constructor(private readonly productCategoryService: ProductCategoryService) {}

  async execute() {
    const foundProductCategories = await this.productCategoryService.getProductCategoriesAsync();

    return foundProductCategories.map((productCategory) => ({
        id: productCategory.id,
        name: productCategory.name,
        description: productCategory.description,
      }));
  }
}