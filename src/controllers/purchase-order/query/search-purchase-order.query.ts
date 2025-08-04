import { Query } from '@nestjs/cqrs';

import { SearchPurchaseOrderFiltersDto, SearchPurchaseOrderRequest, SearchPurchaseOrderResponse, PurchaseOrderSortDto } from '@mp/common/dtos';

export class SearchPurchaseOrderQuery extends Query<SearchPurchaseOrderResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  filters: SearchPurchaseOrderFiltersDto;
  orderBy?: PurchaseOrderSortDto;

  constructor(request: SearchPurchaseOrderRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.filters = request.filters;
    this.orderBy = request.orderBy;
  }
}
