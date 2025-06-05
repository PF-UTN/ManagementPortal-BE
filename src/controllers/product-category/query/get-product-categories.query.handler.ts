import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetProductCategoriesQuery } from './get-product-categories.query';
import { ProductCategoryService } from '../../../domain/service/product-category/product-category.service';

@QueryHandler(GetProductCategoriesQuery)
export class GetProductCategoriesQueryHandler implements IQueryHandler<GetProductCategoriesQuery> {
  constructor(private readonly productCategoryService: ProductCategoryService) {}

  async execute() {
    const foundProductCategories = await this.productCategoryService.getProductCategoryAsync();

    return foundProductCategories.map((productCategory) => ({
        id: productCategory.id,
        name: productCategory.name,
        description: productCategory.description,
      }));
  }
}