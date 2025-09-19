import { Command } from '@nestjs/cqrs';

import { UpdateMaintenanceDto } from '@mp/common/dtos';

export class UpdateVehicleMaintenanceCommand extends Command<void> {
  constructor(
    public readonly maintenanceId: number,
    public readonly updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    super();
  }
}
