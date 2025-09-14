import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  ProductCreationDto,
  ProductDetailsDto,
  ProductSortDto,
  ProductUpdateDto,
  SearchProductFiltersDto,
} from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  StockRepository,
} from '@mp/repository';

import { SearchProductQuery } from '../../../controllers/product/command/search-product-query';
import { VercelBlobService } from '../../../services/vercel-blob.service';
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
    private readonly vercelBlobService: VercelBlobService,
  ) {}

  async searchWithFiltersAsync(query: SearchProductQuery) {
    return await this.productRepository.searchWithFiltersAsync(
      query.searchText,
      query.filters,
      query.page,
      query.pageSize,
      query.orderBy,
    );
  }

  async downloadWithFiltersAsync(
    searchText: string,
    filters: SearchProductFiltersDto,
    orderBy?: ProductSortDto,
  ) {
    return await this.productRepository.downloadWithFiltersAsync(
      searchText,
      filters,
      orderBy,
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
      const { stock, image, ...productData } = productCreationDto;
      let imageUrl: string | undefined;

      const newProduct = await this.productRepository.createProductAsync(
        productData,
        tx,
      );

      if (image) {
        const filename = this.vercelBlobService.generateImageFilename(
          newProduct.id,
          image.originalname,
        );
        imageUrl = await this.vercelBlobService.uploadImage(
          image.buffer,
          filename,
          image.mimetype,
        );

        await this.productRepository.updateProductAsync(
          newProduct.id,
          { ...productData, imageUrl },
          tx,
        );

        newProduct.imageUrl = imageUrl;
      }

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

    const currentProduct =
      await this.productRepository.findProductWithDetailsByIdAsync(id);
    let imageUrl = currentProduct?.imageUrl;

    if (productUpdateDto.image) {
      if (imageUrl) {
        await this.vercelBlobService.deleteImage(imageUrl);
      }

      const filename = this.vercelBlobService.generateImageFilename(
        id,
        productUpdateDto.image.originalname,
      );
      imageUrl = await this.vercelBlobService.uploadImage(
        productUpdateDto.image.buffer,
        filename,
        productUpdateDto.image.mimetype,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, ...productData } = productUpdateDto;
    const updatedProduct = await this.productRepository.updateProductAsync(id, {
      ...productData,
      imageUrl: imageUrl ?? undefined,
    });

    this.deleteProductFromRedisAsync(id);

    return updatedProduct;
  }

  async updateEnabledProductAsync(id: number, enabled: boolean) {
    const existsProduct = await this.productRepository.existsAsync(id);

    if (!existsProduct) {
      throw new NotFoundException(`Product with id ${id} does not exist.`);
    }

    this.deleteProductFromRedisAsync(id);

    return this.productRepository.updateEnabledProductAsync(id, enabled);
  }

  async deleteProductAsync(id: number) {
    const existsProduct = await this.productRepository.existsAsync(id);

    if (!existsProduct) {
      throw new NotFoundException(`Product with id ${id} does not exist.`);
    }

    this.deleteProductFromRedisAsync(id);

    return await this.productRepository.deleteProductAsync(id, new Date());
  }

  async findProductByIdAsync(productId: number) {
    const foundProduct =
      await this.productRepository.getProductByIdFromRedisAsync(productId);

    if (foundProduct) {
      return foundProduct;
    }

    const product =
      await this.productRepository.findProductWithDetailsByIdAsync(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    const productDetail: ProductDetailsDto = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      weight: product.weight.toNumber(),
      imageUrl: product.imageUrl || undefined,
      stock: {
        quantityAvailable: product.stock?.quantityAvailable ?? 0,
        quantityReserved: product.stock?.quantityReserved ?? 0,
        quantityOrdered: product.stock?.quantityOrdered ?? 0,
      },
      category: {
        name: product.category.name,
      },
      supplier: {
        businessName: product.supplier.businessName,
        email: product.supplier.email,
        phone: product.supplier.phone,
      },
      enabled: product.enabled,
    };

    await this.productRepository.saveProductToRedisAsync(productDetail);

    return productDetail;
  }

  async saveProductToRedisAsync(product: ProductDetailsDto): Promise<void> {
    await this.productRepository.saveProductToRedisAsync(product);
  }

  async getProductByIdFromRedisAsync(productId: number) {
    return this.productRepository.getProductByIdFromRedisAsync(productId);
  }

  async deleteProductFromRedisAsync(productId: number): Promise<void> {
    await this.productRepository.deleteProductFromRedisAsync(productId);
  }
}
