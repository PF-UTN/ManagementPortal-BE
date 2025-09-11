import { Command } from '@nestjs/cqrs';

import { MaintenanceItemCreationDto } from '@mp/common/dtos';

export class CreateVehicleMaintenanceItemCommand extends Command<void> {
  constructor(
    public readonly maintenanceItemCreationDto: MaintenanceItemCreationDto,
  ) {
    super();
  }
}
