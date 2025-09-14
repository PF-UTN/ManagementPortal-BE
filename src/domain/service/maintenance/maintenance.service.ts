import { Injectable, NotFoundException } from '@nestjs/common';

import { MaintenanceRepository, VehicleRepository } from '@mp/repository';

import { SearchMaintenanceQuery } from '../../../controllers/vehicle/query/search-maintenance-query';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async findByVehicleIdAsync(vehicleId: number) {
    return await this.maintenanceRepository.findByVehicleIdAsync(vehicleId);
  }

  async searchByTextAndVehicleIdAsync(query: SearchMaintenanceQuery) {
    const existsVehicle = await this.vehicleRepository.existsAsync(
      query.vehicleId,
    );

    if (!existsVehicle) {
      throw new NotFoundException(
        `Vehicle with id ${query.vehicleId} does not exist.`,
      );
    }

    return await this.maintenanceRepository.searchByTextAndVehicleIdAsync(
      query.searchText,
      query.page,
      query.pageSize,
      query.vehicleId,
    );
  }
}
