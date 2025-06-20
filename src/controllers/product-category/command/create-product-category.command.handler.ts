import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateProductCategoryCommand } from './create-product-category.command';
import { ProductCategoryService } from '../../../domain/service/product-category/product-category.service';

@CommandHandler(CreateProductCategoryCommand)
export class CreateProductCategoryCommandHandler
  implements ICommandHandler<CreateProductCategoryCommand>
{
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  async execute(command: CreateProductCategoryCommand) {
    const productCategory =
      await this.productCategoryService.createOrUpdateProductCategoryAsync(
        command.productCategoryCreationDto,
      );
    return productCategory;
  }
}
