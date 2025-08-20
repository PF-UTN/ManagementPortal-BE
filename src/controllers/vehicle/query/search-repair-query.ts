import { Query } from '@nestjs/cqrs';

import { SearchRepairRequest, SearchRepairResponse } from '@mp/common/dtos';

export class SearchRepairQuery extends Query<SearchRepairResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  vehicleId: number;

  constructor(vehicleId: number, request: SearchRepairRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.vehicleId = vehicleId;
  }
}
