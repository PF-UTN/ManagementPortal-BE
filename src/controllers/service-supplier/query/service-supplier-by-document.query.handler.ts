import { QueryHandler } from '@nestjs/cqrs';

import { ServiceSupplierByDocumentQuery } from './service-supplier-by-document.query';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

@QueryHandler(ServiceSupplierByDocumentQuery)
export class ServiceSupplierByDocumentQueryHandler {
  constructor(
    private readonly serviceSupplierService: ServiceSupplierService,
  ) {}

  async execute(query: ServiceSupplierByDocumentQuery) {
    return await this.serviceSupplierService.findByDocumentAsync(
      query.searchServiceSupplierByDocumentDto.documentType,
      query.searchServiceSupplierByDocumentDto.documentNumber,
    );
  }
}
