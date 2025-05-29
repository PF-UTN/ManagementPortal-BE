import { Injectable } from '@nestjs/common';

import { ProductRepository } from '@mp/repository';

import { SearchProductQuery } from '../../../controllers/product/command/search-product-query';

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
    ) {}
    async searchWithFiltersAsync(query: SearchProductQuery) {
        return await this.productRepository.searchWithFiltersAsync(
            query.searchText,
            query.filters,
            query.page,
            query.pageSize,
        );
    }
}

