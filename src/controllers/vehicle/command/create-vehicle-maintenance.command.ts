import { Command } from '@nestjs/cqrs';

import { MaintenanceCreationDto } from '@mp/common/dtos';

export class CreateVehicleMaintenanceCommand extends Command<void> {
  constructor(
    public readonly vehicleId: number,
    public readonly maintenanceCreationDto: MaintenanceCreationDto,
  ) {
    super();
  }
}
