import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';

import { SupplierRepository } from '@mp/repository';

@Injectable()
export class SupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async existsAsync(id: number): Promise<boolean> {
    return this.supplierRepository.existsAsync(id);
  }

  async getAllSuppliersAsync(): Promise<Supplier[]> {
    return this.supplierRepository.getAllSuppliersAsync();
  }
}
