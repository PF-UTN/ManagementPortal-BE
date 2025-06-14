import { Command } from '@nestjs/cqrs';
import { Product } from '@prisma/client';

import { ProductUpdateDto } from '@mp/common/dtos';

export class UpdateProductCommand extends Command<Product> {
  constructor(public readonly productId: number, public readonly productUpdateDto: ProductUpdateDto) {
    super();
  }
}
