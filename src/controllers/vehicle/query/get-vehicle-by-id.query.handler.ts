import { QueryHandler } from '@nestjs/cqrs';

import { VehicleDto } from '@mp/common/dtos';

import { GetVehicleByIdQuery } from './get-vehicle-by-id.query';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

@QueryHandler(GetVehicleByIdQuery)
export class GetVehicleByIdQueryHandler {
  constructor(private readonly vehicleService: VehicleService) {}

  async execute(query: GetVehicleByIdQuery) {
    const vehicle = await this.vehicleService.findByIdAsync(query.id);

    const mappedResponse: VehicleDto = {
      id: vehicle!.id,
      licensePlate: vehicle!.licensePlate,
      brand: vehicle!.brand,
      model: vehicle!.model,
      kmTraveled: vehicle!.kmTraveled,
      admissionDate: vehicle!.admissionDate,
      enabled: vehicle!.enabled,
    };

    return mappedResponse;
  }
}
