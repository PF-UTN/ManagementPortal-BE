import { QueryHandler } from '@nestjs/cqrs';

import { GetShipmentByIdDto } from '@mp/common/dtos';

import { GetShipmentByIdQuery } from './get-shipment-by-id.query';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@QueryHandler(GetShipmentByIdQuery)
export class GetShipmentByIdQueryHandler {
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(query: GetShipmentByIdQuery): Promise<GetShipmentByIdDto> {
    const shipment = await this.shipmentService.findByIdAsync(query.id);

    const orderIds = shipment.orders.map((order) => order.id);

    const mappedResponse: GetShipmentByIdDto = {
      id: shipment.id,
      date: shipment.date,
      estimatedKm: shipment.estimatedKm ? Number(shipment.estimatedKm) : null,
      effectiveKm: shipment.effectiveKm ? Number(shipment.effectiveKm) : null,
      finishedAt: shipment.finishedAt,
      routeLink: shipment.routeLink,
      vehicle: {
        id: shipment.vehicle.id,
        licensePlate: shipment.vehicle.licensePlate,
        brand: shipment.vehicle.brand,
        model: shipment.vehicle.model,
      },
      status: shipment.status.name,
      orders: orderIds,
    };

    return mappedResponse;
  }
}
