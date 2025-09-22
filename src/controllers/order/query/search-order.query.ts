import { Query } from '@nestjs/cqrs';

import { OrderSortDto, SearchOrderFromClientFiltersDto } from '@mp/common/dtos';

import { SearchOrderFromClientRequest } from './../../../../libs/common/src/dtos';
import { SearchOrderFromClientResponse } from './../../../../libs/common/src/dtos';

export class SearchOrderFromClientQuery extends Query<SearchOrderFromClientResponse> {
  authorizationHeader: string;
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  filters: SearchOrderFromClientFiltersDto;
  orderBy?: OrderSortDto;

  constructor(request: SearchOrderFromClientRequest) {
    super();
    this.authorizationHeader = request.authorizationHeader;
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.filters = request.filters;
    this.orderBy = request.orderBy;
  }
}
