import {
  SearchRegistrationRequestFiltersDto,
  SearchRegistrationRequestRequest,
  SearchRegistrationRequestResponse,
} from '@mp/common/dtos';
import { Query } from '@nestjs/cqrs';

export class SearchRegistrationRequestQuery extends Query<SearchRegistrationRequestResponse> {
  searchText: string;
  page: number = 1;
  pageSize: number = 10;
  filters: SearchRegistrationRequestFiltersDto;

  constructor(request: SearchRegistrationRequestRequest) {
    super();
    this.searchText = request.searchText;
    this.page = request.page;
    this.pageSize = request.pageSize;
    this.filters = request.filters;
  }
}
