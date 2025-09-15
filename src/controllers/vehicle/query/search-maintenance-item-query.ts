import { Query } from '@nestjs/cqrs';

import {
  SearchMaintenanceItemRequest,
  SearchMaintenanceItemResponse,
} from '@mp/common/dtos';

export class SearchMaintenanceItemQuery extends Query<SearchMaintenanceItemResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;

  constructor(request: SearchMaintenanceItemRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
  }
}
