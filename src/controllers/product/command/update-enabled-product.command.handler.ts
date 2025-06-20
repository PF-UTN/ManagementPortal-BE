import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateEnabledProductCommand } from './update-enabled-product.command';
import { ProductService } from '../../../domain/service/product/product.service';

@CommandHandler(UpdateEnabledProductCommand)
export class UpdateEnabledProductCommandHandler
  implements ICommandHandler<UpdateEnabledProductCommand>
{
  constructor(private readonly productService: ProductService) {}

  async execute(command: UpdateEnabledProductCommand) {
    await this.productService.updateEnabledProductAsync(
      command.productId,
      command.enabled,
    );
  }
}
