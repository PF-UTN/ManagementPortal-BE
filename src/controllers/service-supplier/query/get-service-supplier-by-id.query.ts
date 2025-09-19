import { Query } from '@nestjs/cqrs';
import { ServiceSupplier } from '@prisma/client';

export class GetServiceSupplierByIdQuery extends Query<ServiceSupplier> {
  constructor(public readonly id: number) {
    super();
  }
}
