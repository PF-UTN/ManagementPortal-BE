import { Injectable } from '@nestjs/common';

import { SupplierRepository } from '@mp/repository';

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async existsAsync(id: number): Promise<boolean> {
    return this.supplierRepository.existsAsync(id);
  }
}
