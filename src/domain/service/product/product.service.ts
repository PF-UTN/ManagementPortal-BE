import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ProductCreationDto, ProductUpdateDto } from '@mp/common/dtos';
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
      const { stock, ...productData } = productCreationDto;

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

  async updateProductAsync(id: number, productUpdateDto: ProductUpdateDto) {
    const existsProduct = await this.productRepository.existsAsync(id);

    if (!existsProduct) {
      throw new NotFoundException(`Product with id ${id} does not exist.`);
    }

    const existsProductCategory = await this.productCategoryService.existsAsync(
      productUpdateDto.categoryId,
    );

    if (!existsProductCategory) {
      throw new BadRequestException(
        `Product category with id ${productUpdateDto.categoryId} does not exist.`,
      );
    }

    const existsSupplier = await this.supplierService.existsAsync(
      productUpdateDto.supplierId,
    );

    if (!existsSupplier) {
      throw new BadRequestException(
        `Supplier with id ${productUpdateDto.supplierId} does not exist.`,
      );
    }

    const updatedProduct = await this.productRepository.updateProductAsync(
      id,
      productUpdateDto,
    );

    return updatedProduct;
  }

  async updateEnabledProductAsync(id: number, enabled: boolean) {
    const existsProduct = await this.productRepository.existsAsync(id);

    if (!existsProduct) {
      throw new NotFoundException(`Product with id ${id} does not exist.`);
    }

    return this.productRepository.updateEnabledProductAsync(id, enabled);
  }

  async findProductByIdAsync(productId: number) {
    return this.productRepository.findProductWithDetailsByIdAsync(productId);
  }
}
