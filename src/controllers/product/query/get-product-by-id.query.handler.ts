import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { ProductDetailsDto } from '@mp/common/dtos';

import { GetProductByIdQuery } from './get-product-by-id.query';
import { ProductService } from '../../../domain/service/product/product.service';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdQueryHandler {
    constructor(
        private readonly productService: ProductService,
    ) {}
    async execute(query: GetProductByIdQuery) {
        const foundProduct =
            await this.productService.findProductByIdAsync(
                query.id
            );

        if (!foundProduct) {
            throw new NotFoundException(
                `Product with ID ${query.id} not found.`,
            );
        }

        const product: ProductDetailsDto = {
            id: foundProduct.id,
            name: foundProduct.name,
            description: foundProduct.description,
            price: foundProduct.price.toNumber(),
            weight: foundProduct.weight.toNumber(),        
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
        return product;
    }
}