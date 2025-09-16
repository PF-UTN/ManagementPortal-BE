import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateVehicleMaintenanceCommand } from './create-vehicle-maintenance.command';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

@CommandHandler(CreateVehicleMaintenanceCommand)
export class CreateVehicleMaintenanceCommandHandler
  implements ICommandHandler<CreateVehicleMaintenanceCommand>
{
  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(command: CreateVehicleMaintenanceCommand) {
    await this.maintenanceService.createMaintenanceAsync(
      command.vehicleId,
      command.maintenanceCreationDto,
    );
  }
}
