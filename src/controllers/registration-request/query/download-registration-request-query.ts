import { Query } from '@nestjs/cqrs';

import {
  DownloadRegistrationRequestDto,
  DownloadRegistrationRequestRequest,
  SearchRegistrationRequestFiltersDto,
} from '@mp/common/dtos';

export class DownloadRegistrationRequestQuery extends Query<
  DownloadRegistrationRequestDto[]
> {
  searchText: string;
  filters: SearchRegistrationRequestFiltersDto;

  constructor(request: DownloadRegistrationRequestRequest) {
    super();
    this.searchText = request.searchText;
    this.filters = request.filters;
  }
}
