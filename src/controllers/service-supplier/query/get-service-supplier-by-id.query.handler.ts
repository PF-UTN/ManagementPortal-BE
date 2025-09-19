import { QueryHandler } from '@nestjs/cqrs';

import { GetServiceSupplierByIdQuery } from './get-service-supplier-by-id.query';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

@QueryHandler(GetServiceSupplierByIdQuery)
export class GetServiceSupplierByIdQueryHandler {
  constructor(
    private readonly serviceSupplierService: ServiceSupplierService,
  ) {}

  async execute(query: GetServiceSupplierByIdQuery) {
    return await this.serviceSupplierService.findByIdAsync(query.id);
  }
}
