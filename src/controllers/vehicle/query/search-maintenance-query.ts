import { Query } from '@nestjs/cqrs';

import {
  SearchMaintenanceRequest,
  SearchMaintenanceResponse,
} from '@mp/common/dtos';

export class SearchMaintenanceQuery extends Query<SearchMaintenanceResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  vehicleId: number;

  constructor(vehicleId: number, request: SearchMaintenanceRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.vehicleId = vehicleId;
  }
}
