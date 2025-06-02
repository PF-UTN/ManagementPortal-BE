import { Injectable } from '@nestjs/common';

import { ProductCategoryRepository } from '@mp/repository';

@Injectable()
export class ProductCategoryService {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async checkIfExistsByIdAsync(id: number): Promise<boolean> {
    return this.productCategoryRepository.checkIfExistsByIdAsync(id);
  }
}
