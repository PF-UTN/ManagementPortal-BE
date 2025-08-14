import { Command } from '@nestjs/cqrs';

import { MaintenancePlanItemCreationDto } from '@mp/common/dtos';

export class CreateVehicleMaintenancePlanItemCommand extends Command<void> {
  constructor(
    public readonly maintenancePlanItemCreationDto: MaintenancePlanItemCreationDto,
  ) {
    super();
  }
}
