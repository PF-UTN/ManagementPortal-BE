import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateProductCommand } from './create-product.command';
import { ProductService } from '../../../domain/service/product/product.service';

@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(private readonly productService: ProductService) {}

  async execute(command: CreateProductCommand) {
    const product = await this.productService.createProductAsync(
      command.productCreationDto,
    );
    return product;
  }
}
