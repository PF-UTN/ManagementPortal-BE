import { SearchRegistrationRequestFiltersDto } from './search-registration-request-filters.dto';

export class SearchRegistrationRequestRequest {
  searchText: string;
  page: number;
  pageSize: number;
  filters: SearchRegistrationRequestFiltersDto;

  constructor(
    searchText: string,
    filters: SearchRegistrationRequestFiltersDto,
    page: number,
    pageSize: number,
  ) {
    this.searchText = searchText;
    this.filters = filters;
    this.page = page;
    this.pageSize = pageSize;
  }
}
