import { QueryHandler } from '@nestjs/cqrs';

import { SupplierByDocumentQuery } from './supplier-by-document.query';
import { SupplierService } from '../../../domain/service/supplier/supplier.service';

@QueryHandler(SupplierByDocumentQuery)
export class SupplierByDocumentQueryHandler {
  constructor(private readonly supplierService: SupplierService) {}

  async execute(query: SupplierByDocumentQuery) {
    return await this.supplierService.findByDocumentAsync(
      query.supplierDocumentSearchDto.documentType,
      query.supplierDocumentSearchDto.documentNumber,
    );
  }
}
