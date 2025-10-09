import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { shipmentStatusTranslations } from '@mp/common/constants';
import { DownloadShipmentDto } from '@mp/common/dtos';

import { DownloadShipmentQuery } from './download-shipment.query';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@QueryHandler(DownloadShipmentQuery)
export class DownloadShipmentQueryHandler
  implements IQueryHandler<DownloadShipmentQuery>
{
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(query: DownloadShipmentQuery): Promise<DownloadShipmentDto[]> {
    const data = await this.shipmentService.downloadWithFiltersAsync(query);

    return data.map((shipment): DownloadShipmentDto => {
      return {
        ID: shipment.id,
        Fecha: shipment.date,
        Vehiculo: `${shipment.vehicle.licensePlate}, ${shipment.vehicle.brand} ${shipment.vehicle.model}`,
        Estado: shipmentStatusTranslations[shipment.status.name],
        Pedidos_Asociados: shipment.orders.map((order) => order.id).join(', '),
        Kilometros_Estimados: shipment.estimatedKm
          ? Number(shipment.estimatedKm)
          : null,
        Kilometros_Efectivos: shipment.effectiveKm
          ? Number(shipment.effectiveKm)
          : null,
        Link_Ruta: shipment.routeLink ? shipment.routeLink : null,
      };
    });
  }
}
