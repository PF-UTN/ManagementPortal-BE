import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductDetailsDto } from '@mp/common/dtos';

import { ProductService } from './../../../domain/service/product/product.service';
import { SaveProductRedisCommand } from './save-product-redis.command';

@CommandHandler(SaveProductRedisCommand)
export class SaveProductRedisCommandHandler
  implements ICommandHandler<SaveProductRedisCommand>
{
  constructor(private readonly productService: ProductService) {}

  async execute(command: SaveProductRedisCommand): Promise<ProductDetailsDto> {
    const foundProduct = await this.productService.findProductByIdAsync(
      command.productId,
    );

    if (!foundProduct) {
      throw new NotFoundException('Product not found');
    }
    await this.productService.saveProductToRedisAsync(foundProduct);

    return foundProduct;
  }
}
