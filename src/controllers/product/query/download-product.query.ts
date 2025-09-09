import { Query } from '@nestjs/cqrs';

import {
  DownloadProductItemDto,
  DownloadProductRequest,
  ProductSortDto,
  SearchProductFiltersDto,
} from '@mp/common/dtos';

export class DownloadProductQuery extends Query<DownloadProductItemDto[]> {
  searchText: string;
  filters: SearchProductFiltersDto;
  orderBy?: ProductSortDto;

  constructor(request: DownloadProductRequest) {
    super();
    this.searchText = request.searchText;
    this.filters = request.filters;
    this.orderBy = request.orderBy;
  }
}
