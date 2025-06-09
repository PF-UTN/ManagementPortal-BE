import { Injectable } from '@nestjs/common';

import { ProductCategoryRepository } from '@mp/repository';

@Injectable()
export class ProductCategoryService {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async existsAsync(id: number): Promise<boolean> {
    return this.productCategoryRepository.existsAsync(id);
  }

  async getProductCategoriesAsync() {
    return await this.productCategoryRepository.getProductCategoriesAsync();
  }
}
