import { Query } from '@nestjs/cqrs';

import {
  SearchOrderFiltersDto,
  SearchOrderRequest,
  SearchOrderResponse,
  OrderSortDto,
} from '@mp/common/dtos';

export class SearchOrderQuery extends Query<SearchOrderResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  filters: SearchOrderFiltersDto;
  orderBy?: OrderSortDto;

  constructor(request: SearchOrderRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.filters = request.filters;
    this.orderBy = request.orderBy;
  }
}
