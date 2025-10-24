import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DownloadShipmentReportQuery } from './download-shipment-report.query';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@QueryHandler(DownloadShipmentReportQuery)
export class DownloadShipmentReportQueryHandler
  implements IQueryHandler<DownloadShipmentReportQuery>
{
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(query: DownloadShipmentReportQuery) {
    return this.shipmentService.downloadReportAsync(query.id);
  }
}
