import { Query } from '@nestjs/cqrs';
import { Supplier } from '@prisma/client';

import { SupplierDocumentSearchDto } from '@mp/common/dtos';

export class SupplierByDocumentQuery extends Query<Supplier> {
  constructor(
    public readonly supplierDocumentSearchDto: SupplierDocumentSearchDto,
  ) {
    super();
  }
}
