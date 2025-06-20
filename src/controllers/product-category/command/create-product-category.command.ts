import { Command } from '@nestjs/cqrs';
import { ProductCategory } from '@prisma/client';

import { ProductCategoryCreationDto } from '@mp/common/dtos';

export class CreateProductCategoryCommand extends Command<ProductCategory> {
  constructor(
    public readonly productCategoryCreationDto: ProductCategoryCreationDto,
  ) {
    super();
  }
}
