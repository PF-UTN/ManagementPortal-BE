import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  orderStatusTranslations,
  shipmentStatusTranslations,
} from '@mp/common/constants';
import {
  SearchShipmentReturnDataDto,
  SearchShipmentResponse,
} from '@mp/common/dtos';

import { SearchShipmentQuery } from './search-shipment.query';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@QueryHandler(SearchShipmentQuery)
export class SearchShipmentQueryHandler
  implements IQueryHandler<SearchShipmentQuery>
{
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(query: SearchShipmentQuery): Promise<SearchShipmentResponse> {
    const { data, total } =
      await this.shipmentService.searchWithFiltersAsync(query);

    const mappedResponse = data.map((shipment): SearchShipmentReturnDataDto => {
      return {
        id: shipment.id,
        date: shipment.date,
        vehicle: {
          id: shipment.vehicle.id,
          licensePlate: shipment.vehicle.licensePlate,
          brand: shipment.vehicle.brand,
          model: shipment.vehicle.model,
        },
        status: shipmentStatusTranslations[shipment.status.name],
        orders: shipment.orders.map((order) => ({
          id: order.id,
          status: orderStatusTranslations[order.orderStatus.name],
        })),
        estimatedKm: shipment.estimatedKm ? Number(shipment.estimatedKm) : null,
        effectiveKm: shipment.effectiveKm ? Number(shipment.effectiveKm) : null,
        routeLink: shipment.routeLink,
      };
    });

    return new SearchShipmentResponse({
      total,
      results: mappedResponse,
    });
  }
}
