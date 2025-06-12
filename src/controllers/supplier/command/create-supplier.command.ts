import { Command } from '@nestjs/cqrs';
import { Supplier } from '@prisma/client';

import { SupplierCreationDto } from '@mp/common/dtos';

export class CreateSupplierCommand extends Command<Supplier> {
  constructor(public readonly supplierCreationDto: SupplierCreationDto) {
    super();
  }
}
