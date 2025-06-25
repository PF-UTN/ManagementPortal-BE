import { Query } from '@nestjs/cqrs';

import {
  SearchTownRequest,
  SearchTownResponse,
} from '@mp/common/dtos';

export class SearchTownQuery extends Query<SearchTownResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;

  constructor(request: SearchTownRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
  }
}
