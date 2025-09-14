import { Command } from '@nestjs/cqrs';

import { UpdateMaintenanceItemDto } from '@mp/common/dtos';

export class UpdateVehicleMaintenanceItemCommand extends Command<void> {
  constructor(
    public readonly maintenanceItemId: number,
    public readonly updateMaintenanceItemDto: UpdateMaintenanceItemDto,
  ) {
    super();
  }
}
