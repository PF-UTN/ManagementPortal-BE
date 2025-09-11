import { Query } from '@nestjs/cqrs';

import { DownloadVehicleDto, DownloadVehicleRequest } from '@mp/common/dtos';

export class DownloadVehiclesQuery extends Query<DownloadVehicleDto[]> {
  searchText: string;

  constructor(request: DownloadVehicleRequest) {
    super();
    this.searchText = request.searchText;
  }
}
