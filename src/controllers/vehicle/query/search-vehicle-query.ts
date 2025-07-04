import { Query } from '@nestjs/cqrs';

import {
  SearchVehicleRequest,
  SearchVehicleResponse,
} from '@mp/common/dtos';

export class SearchVehicleQuery extends Query<SearchVehicleResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;

  constructor(request: SearchVehicleRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
  }
}
