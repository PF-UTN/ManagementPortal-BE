import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';

import { SupplierRepository } from '@mp/repository';

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async getAllSuppliersAsync(): Promise<Supplier[]> {
    return this.supplierRepository.getAllSuppliersAsync();
  }
}