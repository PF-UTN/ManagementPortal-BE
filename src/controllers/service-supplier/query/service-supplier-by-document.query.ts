import { Query } from '@nestjs/cqrs';
import { ServiceSupplier } from '@prisma/client';

import { SearchServiceSupplierByDocumentDto } from '@mp/common/dtos';

export class ServiceSupplierByDocumentQuery extends Query<ServiceSupplier> {
  constructor(
    public readonly searchServiceSupplierByDocumentDto: SearchServiceSupplierByDocumentDto,
  ) {
    super();
  }
}
