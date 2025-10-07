import { Query } from '@nestjs/cqrs';

import {
  SearchShipmentFiltersDto,
  DownloadShipmentRequest,
  DownloadShipmentDto,
} from '@mp/common/dtos';

export class DownloadShipmentQuery extends Query<DownloadShipmentDto[]> {
  searchText: string;
  filters: SearchShipmentFiltersDto;

  constructor(request: DownloadShipmentRequest) {
    super();
    this.searchText = request.searchText;
    this.filters = request.filters;
  }
}
