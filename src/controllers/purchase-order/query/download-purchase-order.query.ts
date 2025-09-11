import { Query } from '@nestjs/cqrs';

import {
  SearchPurchaseOrderFiltersDto,
  PurchaseOrderSortDto,
  DownloadPurchaseOrderRequest,
  DownloadPurchaseOrderDto,
} from '@mp/common/dtos';

export class DownloadPurchaseOrderQuery extends Query<
  DownloadPurchaseOrderDto[]
> {
  searchText: string;
  filters: SearchPurchaseOrderFiltersDto;
  orderBy?: PurchaseOrderSortDto;

  constructor(request: DownloadPurchaseOrderRequest) {
    super();
    this.searchText = request.searchText;
    this.filters = request.filters;
    this.orderBy = request.orderBy;
  }
}
