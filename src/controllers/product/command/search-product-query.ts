import { Query } from '@nestjs/cqrs';

import { 
    SearchProductFiltersDto, 
    SearchProductResponse,
    SearchProductRequestDto,
} from '@mp/common/dtos';

export class SearchProductQuery extends Query<SearchProductResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  filters: SearchProductFiltersDto;

  constructor(request: SearchProductRequestDto) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.filters = request.filters;
  }
}
