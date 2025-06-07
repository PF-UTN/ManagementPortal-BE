import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ProductCreationDto } from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  StockRepository,
} from '@mp/repository';

import { SearchProductQuery } from '../../../controllers/product/command/search-product-query';
import { ProductCategoryService } from '../product-category/product-category.service';
import { SupplierService } from '../supplier/supplier.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productCategoryService: ProductCategoryService,
    private readonly supplierService: SupplierService,
    private readonly stockRepository: StockRepository,
    private readonly unitOfWork: PrismaUnitOfWork,
  ) {}

  async searchWithFiltersAsync(query: SearchProductQuery) {
    return await this.productRepository.searchWithFiltersAsync(
      query.searchText,
      query.filters,
      query.page,
      query.pageSize,
    );
  }

  async createProductAsync(productCreationDto: ProductCreationDto) {
    const existsProductCategory = await this.productCategoryService.existsAsync(
      productCreationDto.categoryId,
    );

    if (!existsProductCategory) {
      throw new BadRequestException(
        `Product category with id ${productCreationDto.categoryId} does not exist.`,
      );
    }

    const existsSupplier = await this.supplierService.existsAsync(
      productCreationDto.supplierId,
    );

    if (!existsSupplier) {
      throw new BadRequestException(
        `Supplier with id ${productCreationDto.supplierId} does not exist.`,
      );
    }

    return this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      const { stock, ...productData } =
        productCreationDto;

      const newProduct = await this.productRepository.createProductAsync(
        productData,
        tx,
      );

      await this.stockRepository.createStockAsync(
        {
          ...stock,
          productId: newProduct.id,
        },
        tx,
      );

      return newProduct;
    });
  }
}
