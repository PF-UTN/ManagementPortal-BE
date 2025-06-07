import { Query } from '@nestjs/cqrs';

import { ProductCategoryDto } from '@mp/common/dtos';

export class ProductCategoriesQuery extends Query<ProductCategoryDto[]> {}
