import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SearchVehicleResponse, VehicleDto } from '@mp/common/dtos';

import { SearchVehicleQuery } from './search-vehicle-query';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

@QueryHandler(SearchVehicleQuery)
export class SearchVehicleQueryHandler
  implements IQueryHandler<SearchVehicleQuery>
{
  constructor(private readonly vehicleService: VehicleService) {}

  async execute(query: SearchVehicleQuery): Promise<SearchVehicleResponse> {
    const { data, total } = await this.vehicleService.searchByTextAsync(query);

    const mappedResponse = data.map((vehicle): VehicleDto => {
      return {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        kmTraveled: vehicle.kmTraveled,
        admissionDate: vehicle.admissionDate,
        enabled: vehicle.enabled,
      };
    });

    return new SearchVehicleResponse({
      total,
      results: mappedResponse,
    });
  }
}
