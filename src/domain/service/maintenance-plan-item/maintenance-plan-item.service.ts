import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MaintenancePlanItemCreationDto } from '@mp/common/dtos';
import {
  MaintenanceItemRepository,
  MaintenancePlanItemRepository,
  VehicleRepository,
} from '@mp/repository';

@Injectable()
export class MaintenancePlanItemService {
  constructor(
    private readonly maintenancePlanItemRepository: MaintenancePlanItemRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly maintenanceItemRepository: MaintenanceItemRepository,
  ) {}

  async createMaintenancePlanItemAsync(
    maintenancePlanItemCreationDto: MaintenancePlanItemCreationDto,
  ) {
    const existsVehicle = await this.vehicleRepository.existsAsync(
      maintenancePlanItemCreationDto.vehicleId,
    );

    if (!existsVehicle) {
      throw new NotFoundException(
        `Vehicle with id ${maintenancePlanItemCreationDto.vehicleId} does not exist.`,
      );
    }

    const existsMaintenanceItem =
      await this.maintenanceItemRepository.existsAsync(
        maintenancePlanItemCreationDto.maintenanceItemId,
      );

    if (!existsMaintenanceItem) {
      throw new NotFoundException(
        `Maintenance item with id ${maintenancePlanItemCreationDto.maintenanceItemId} does not exist.`,
      );
    }

    return await this.maintenancePlanItemRepository.createMaintenancePlanItemAsync(
      maintenancePlanItemCreationDto,
    );
  }
}
