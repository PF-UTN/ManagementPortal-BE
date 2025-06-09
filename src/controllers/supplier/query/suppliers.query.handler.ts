import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { SuppliersQuery } from './suppliers.query';
import { SupplierService } from '../../../domain/service/supplier/supplier.service';

@QueryHandler(SuppliersQuery)
export class SuppliersQueryHandler {
  constructor(
    private readonly supplierService: SupplierService,
  ) {}

  async execute() {
    const foundSuppliers =
      await this.supplierService.getAllSuppliersAsync();

    if (foundSuppliers.length === 0) {
      throw new NotFoundException(
        'No suppliers found.',
      );
    }

    return foundSuppliers;
  }
}
