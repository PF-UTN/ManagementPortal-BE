import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateProductCommand } from './update-product.command';
import { ProductService } from '../../../domain/service/product/product.service';

@CommandHandler(UpdateProductCommand)
export class UpdateProductCommandHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(private readonly productService: ProductService) {}

  async execute(command: UpdateProductCommand) {
    const product = await this.productService.updateProductAsync(
      command.productId,
      command.productUpdateDto,
    );
    return product;
  }
}
