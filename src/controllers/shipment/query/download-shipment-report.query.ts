import { Query } from '@nestjs/cqrs';

import { DownloadShipmentReportDto } from '@mp/common/dtos';

export class DownloadShipmentReportQuery extends Query<DownloadShipmentReportDto> {
  constructor(public readonly id: number) {
    super();
  }
}
