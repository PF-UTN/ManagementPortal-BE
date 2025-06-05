import { Query } from '@nestjs/cqrs';

import { ProductCategoryDto } from '@mp/common/dtos';

export class GetProductCategoriesQuery extends Query<ProductCategoryDto[]> {}
