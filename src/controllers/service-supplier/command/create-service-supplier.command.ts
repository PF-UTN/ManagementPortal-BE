import { Command } from '@nestjs/cqrs';
import { ServiceSupplier } from '@prisma/client';

import { ServiceSupplierCreationDto } from '@mp/common/dtos';

export class CreateServiceSupplierCommand extends Command<ServiceSupplier> {
  constructor(
    public readonly serviceSupplierCreationDto: ServiceSupplierCreationDto,
  ) {
    super();
  }
}
