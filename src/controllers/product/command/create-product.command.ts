import { Command } from '@nestjs/cqrs';
import { Product } from '@prisma/client';

import { ProductCreationDto } from '@mp/common/dtos';

export class CreateProductCommand extends Command<Product> {
  constructor(public readonly productCreationDto: ProductCreationDto) {
    super();
  }
}
