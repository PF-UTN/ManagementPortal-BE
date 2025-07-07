import { Query } from '@nestjs/cqrs';

import { 
    SearchProductFiltersDto, 
    SearchProductResponse,
    SearchProductRequest,
    ProductOrderDto,
} from '@mp/common/dtos';

export class SearchProductQuery extends Query<SearchProductResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  filters: SearchProductFiltersDto;
  order?: ProductOrderDto;

  constructor(request: SearchProductRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.filters = request.filters;
    this.order = request.order;
  }
}
