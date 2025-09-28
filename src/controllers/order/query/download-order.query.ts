import { Query } from '@nestjs/cqrs';

import {
  SearchOrderFiltersDto,
  OrderSortDto,
  DownloadOrderRequest,
  DownloadOrderDto,
} from '@mp/common/dtos';

export class DownloadOrderQuery extends Query<DownloadOrderDto[]> {
  searchText: string;
  filters: SearchOrderFiltersDto;
  orderBy?: OrderSortDto;

  constructor(request: DownloadOrderRequest) {
    super();
    this.searchText = request.searchText;
    this.filters = request.filters;
    this.orderBy = request.orderBy;
  }
}
