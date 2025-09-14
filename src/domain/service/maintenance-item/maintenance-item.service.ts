import { Injectable, NotFoundException } from '@nestjs/common';

import {
  MaintenanceItemCreationDto,
  UpdateMaintenanceItemDto,
} from '@mp/common/dtos';
import { MaintenanceItemRepository } from '@mp/repository';

import { SearchMaintenanceItemQuery } from '../../../controllers/vehicle/query/search-maintenance-item-query';

@Injectable()
export class MaintenanceItemService {
  constructor(
    private readonly maintenanceItemRepository: MaintenanceItemRepository,
  ) {}

  async createMaintenanceItemAsync(
    maintenanceItemCreationDto: MaintenanceItemCreationDto,
  ) {
    return await this.maintenanceItemRepository.createMaintenanceItemAsync(
      maintenanceItemCreationDto,
    );
  }

  async searchByTextAsync(query: SearchMaintenanceItemQuery) {
    return await this.maintenanceItemRepository.searchByTextAsync(
      query.searchText,
      query.page,
      query.pageSize,
    );
  }

  async updateMaintenanceItemAsync(
    id: number,
    updateMaintenanceItemDto: UpdateMaintenanceItemDto,
  ) {
    const existsMaintenanceItem =
      await this.maintenanceItemRepository.existsAsync(id);

    if (!existsMaintenanceItem) {
      throw new NotFoundException(
        `Maintenance item with id ${id} does not exist.`,
      );
    }

    return await this.maintenanceItemRepository.updateMaintenanceItemAsync(
      id,
      updateMaintenanceItemDto,
    );
  }
}
