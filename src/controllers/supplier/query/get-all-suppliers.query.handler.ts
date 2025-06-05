import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { GetAllSuppliersQuery } from './get-all-suppliers.query';
import { SupplierService } from '../../../domain/service/supplier/supplier.service';

@QueryHandler(GetAllSuppliersQuery)
export class GetAllSuppliersQueryHandler {
  constructor(
    private readonly supplierService: SupplierService,
  ) {}

  async execute() {
    const foundSuppliers =
      await this.supplierService.getAllSuppliersAsync();

    if (!foundSuppliers || foundSuppliers.length === 0) {
      throw new NotFoundException(
        'No suppliers found.',
      );
    }

    return foundSuppliers;
  }
}
