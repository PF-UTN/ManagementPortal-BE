import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  MaintenancePlanItemCreationDto,
  UpdateMaintenancePlanItemDto,
} from '@mp/common/dtos';
import {
  MaintenanceItemRepository,
  MaintenancePlanItemRepository,
  MaintenanceRepository,
  VehicleRepository,
} from '@mp/repository';

import { SearchMaintenancePlanItemQuery } from '../../../controllers/vehicle/query/search-maintenance-plan-item-query';

@Injectable()
export class MaintenancePlanItemService {
  constructor(
    private readonly maintenancePlanItemRepository: MaintenancePlanItemRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly maintenanceItemRepository: MaintenanceItemRepository,
    private readonly maintenanceRepository: MaintenanceRepository,
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

  async searchByTextAndVehicleIdAsync(query: SearchMaintenancePlanItemQuery) {
    const existsVehicle = await this.vehicleRepository.existsAsync(
      query.vehicleId,
    );

    if (!existsVehicle) {
      throw new NotFoundException(
        `Vehicle with id ${query.vehicleId} does not exist.`,
      );
    }

    return await this.maintenancePlanItemRepository.searchByTextAndVehicleIdAsync(
      query.searchText,
      query.page,
      query.pageSize,
      query.vehicleId,
    );
  }

  async updateMaintenancePlanItemAsync(
    id: number,
    updateMaintenancePlanItemDto: UpdateMaintenancePlanItemDto,
  ) {
    const existsMaintenancePlanItem =
      await this.maintenancePlanItemRepository.existsAsync(id);

    if (!existsMaintenancePlanItem) {
      throw new NotFoundException(
        `Maintenance plan item with id ${id} does not exist.`,
      );
    }

    const existsMaintenanceItem =
      await this.maintenanceItemRepository.existsAsync(
        updateMaintenancePlanItemDto.maintenanceItemId,
      );

    if (!existsMaintenanceItem) {
      throw new NotFoundException(
        `Maintenance item with id ${updateMaintenancePlanItemDto.maintenanceItemId} does not exist.`,
      );
    }

    return await this.maintenancePlanItemRepository.updateMaintenancePlanItemAsync(
      id,
      updateMaintenancePlanItemDto,
    );
  }

  async deleteMaintenancePlanItemAsync(id: number) {
    const existsMaintenancePlanItem =
      await this.maintenancePlanItemRepository.existsAsync(id);

    if (!existsMaintenancePlanItem) {
      throw new NotFoundException(
        `Maintenance plan item with id ${id} does not exist.`,
      );
    }

    const isUsedInMaintenance =
      await this.maintenanceRepository.existsByMaintenancePlanItemIdAsync(id);

    if (isUsedInMaintenance) {
      throw new BadRequestException(
        `Maintenance plan item with id ${id} is being used in a Maintenance and cannot be deleted.`,
      );
    }

    return await this.maintenancePlanItemRepository.deleteMaintenancePlanItemAsync(
      id,
    );
  }
}
