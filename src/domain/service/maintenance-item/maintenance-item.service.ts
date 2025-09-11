import { Injectable } from '@nestjs/common';

import { MaintenanceItemCreationDto } from '@mp/common/dtos';
import { MaintenanceItemRepository } from '@mp/repository';

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
}
