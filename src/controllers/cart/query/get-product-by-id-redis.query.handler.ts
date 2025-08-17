import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { ProductDetailsDto } from '@mp/common/dtos';

import { CartService } from './../../../domain/service/cart/cart.service';
import { GetProductByIdRedisQuery } from './get-product-by-id-redis.query';

@QueryHandler(GetProductByIdRedisQuery)
export class GetProductByIdRedisQueryHandler {
  constructor(
    private readonly cartService: CartService
) {}
    async execute(query: GetProductByIdRedisQuery) {
        const foundProduct =
            await this.cartService.getProductByIdFromRedisAsync(
                query.id
            );
        
        if(!foundProduct) {
            throw new NotFoundException(
                `Product with ID ${query.id} not found in Redis.`,
            );
        }

        const product: ProductDetailsDto = {
            id: foundProduct.id,
            name: foundProduct.name,
            description: foundProduct.description,
            price: foundProduct.price,
            weight: foundProduct.weight,        
            stock: {
                quantityAvailable: foundProduct.stock?.quantityAvailable ?? 0,
                quantityReserved: foundProduct.stock?.quantityReserved ?? 0,
                quantityOrdered: foundProduct.stock?.quantityOrdered ?? 0,
            },
            category: {
                name: foundProduct.category.name,
            },
            supplier: {
                businessName: foundProduct.supplier.businessName,
                email: foundProduct.supplier.email,
                phone: foundProduct.supplier.phone,
            },
            enabled: foundProduct.enabled,
        };
        return product
    }
}
