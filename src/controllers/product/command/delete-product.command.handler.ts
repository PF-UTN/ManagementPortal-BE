import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteProductCommand } from './delete-product.command';
import { ProductService } from '../../../domain/service/product/product.service';

@CommandHandler(DeleteProductCommand)
export class DeleteProductCommandHandler
  implements ICommandHandler<DeleteProductCommand>
{
  constructor(private readonly productService: ProductService) {}

  async execute(command: DeleteProductCommand) {
    await this.productService.deleteProductAsync(
      command.productId,
    );
  }
}
