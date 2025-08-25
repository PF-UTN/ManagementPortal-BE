import { Query } from '@nestjs/cqrs';

import {
  SearchMaintenancePlanItemRequest,
  SearchMaintenancePlanItemResponse,
} from '@mp/common/dtos';

export class SearchMaintenancePlanItemQuery extends Query<SearchMaintenancePlanItemResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  vehicleId: number;

  constructor(vehicleId: number, request: SearchMaintenancePlanItemRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.vehicleId = vehicleId;
  }
}
