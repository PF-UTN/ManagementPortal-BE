import { Injectable } from '@nestjs/common';

import { ProductCategoryRepository } from '@mp/repository';

@Injectable()
export class ProductCategoryService {
  constructor(private readonly productCategoryRepository: ProductCategoryRepository) {}

  async getCategoriesAsync() {
    return await this.productCategoryRepository.getCategoriesAsync();
  }
}