import { Command } from '@nestjs/cqrs';

import { UpdateMaintenancePlanItemDto } from '@mp/common/dtos';

export class UpdateVehicleMaintenancePlanItemCommand extends Command<void> {
  constructor(
    public readonly maintenancePlanItemId: number,
    public readonly updateMaintenancePlanItemDto: UpdateMaintenancePlanItemDto,
  ) {
    super();
  }
}
