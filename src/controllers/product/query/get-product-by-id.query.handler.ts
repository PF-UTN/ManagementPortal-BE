import { QueryHandler } from '@nestjs/cqrs';

import { GetProductByIdQuery } from './get-product-by-id.query';
import { ProductService } from '../../../domain/service/product/product.service';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdQueryHandler {
  constructor(private readonly productService: ProductService) {}
  async execute(query: GetProductByIdQuery) {
    return await this.productService.findProductByIdAsync(query.id);
  }
}
