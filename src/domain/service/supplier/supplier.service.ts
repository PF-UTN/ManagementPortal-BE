import { Injectable } from '@nestjs/common';

import { SupplierRepository } from '@mp/repository';

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async checkIfExistsByIdAsync(id: number): Promise<boolean> {
    return this.supplierRepository.checkIfExistsByIdAsync(id);
  }
}
