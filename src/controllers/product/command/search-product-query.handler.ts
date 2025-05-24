import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  ProductDto,
  SearchProductResponse,
} from '@mp/common/dtos';

import { SearchProductQuery } from './search-product-query';
import { ProductService } from '../../../domain/service/product/product.service';

@QueryHandler(SearchProductQuery)
export class SearchProductQueryHandler
    implements IQueryHandler<SearchProductQuery>
    {
    constructor(
        private readonly productService: ProductService,
    ) {}
    
    async execute(
        query: SearchProductQuery,
    ): Promise<SearchProductResponse> {
        const { data, total } =
            await this.productService.searchWithFiltersAsync(query);

        const mappedResponse = data.map(
            (product): ProductDto => {
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    enabled: product.enabled,
                    weight: product.weight,
                    categoryName: product.category.name,
                    supplierBusinessName: product.supplier.businessName,
                    stock: product.stock?.quantityAvailable, 
                };
            },
        );

        return new SearchProductResponse({
            total,
            results: mappedResponse,
        });
    }
}