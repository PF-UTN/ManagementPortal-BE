import { Query } from '@nestjs/cqrs';

import {
  SearchShipmentFiltersDto,
  SearchShipmentRequest,
  SearchShipmentResponse,
} from '@mp/common/dtos';

export class SearchShipmentQuery extends Query<SearchShipmentResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  filters: SearchShipmentFiltersDto;

  constructor(request: SearchShipmentRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.filters = request.filters;
  }
}
