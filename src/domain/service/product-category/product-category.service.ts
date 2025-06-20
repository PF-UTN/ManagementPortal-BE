import { BadRequestException, Injectable } from '@nestjs/common';

import { ProductCategoryCreationDto } from '@mp/common/dtos';
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

  async createOrUpdateProductCategoryAsync(
    productCategoryCreationData: ProductCategoryCreationDto,
  ) {
    const { id, ...productCategoryData } = productCategoryCreationData;

    if (id) {
      const existsProductCategory =
        await this.productCategoryRepository.existsAsync(id);

      if (!existsProductCategory) {
        throw new BadRequestException(
          `Product category with id ${id} does not exist.`,
        );
      }

      return this.productCategoryRepository.updateProductCategoryAsync(
        id,
        productCategoryData,
      );
    }

    return this.productCategoryRepository.createProductCategoryAsync(
      productCategoryData,
    );
  }
}
