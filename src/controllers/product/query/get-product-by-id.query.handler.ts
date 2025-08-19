import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { ProductDetailsDto } from '@mp/common/dtos';

import { CartService } from './../../../domain/service/cart/cart.service';
import { GetProductByIdQuery } from './get-product-by-id.query';
import { ProductService } from '../../../domain/service/product/product.service';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdQueryHandler {
  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
  ) {}
  async execute(query: GetProductByIdQuery) {
    const foundProduct = await this.cartService.getProductByIdFromRedisAsync(
      query.id,
    );

    if (!foundProduct) {
      const dbProduct = await this.productService.findProductByIdAsync(
        query.id,
      );

      if (!dbProduct) {
        throw new NotFoundException(`Product with ID ${query.id} not found.`);
      }

      const product: ProductDetailsDto = {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        price: dbProduct.price.toNumber(),
        weight: dbProduct.weight.toNumber(),
        stock: {
          quantityAvailable: dbProduct.stock?.quantityAvailable ?? 0,
          quantityReserved: dbProduct.stock?.quantityReserved ?? 0,
          quantityOrdered: dbProduct.stock?.quantityOrdered ?? 0,
        },
        category: {
          name: dbProduct.category.name,
        },
        supplier: {
          businessName: dbProduct.supplier.businessName,
          email: dbProduct.supplier.email,
          phone: dbProduct.supplier.phone,
        },
        enabled: dbProduct.enabled,
      };

      await this.cartService.saveProductToRedisAsync(product);

      return product;
    }

    return foundProduct;
  }
}
