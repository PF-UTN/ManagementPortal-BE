import { Injectable } from '@nestjs/common';
import { SearchProductQuery } from 'src/controllers/product/command/search-product-query';

import { ProductRepository } from '@mp/repository';

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

