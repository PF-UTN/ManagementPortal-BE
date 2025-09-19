import { Query } from '@nestjs/cqrs';

import {
  SearchServiceSupplierRequest,
  SearchServiceSupplierResponse,
} from '@mp/common/dtos';

export class SearchServiceSupplierQuery extends Query<SearchServiceSupplierResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;

  constructor(request: SearchServiceSupplierRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
  }
}
