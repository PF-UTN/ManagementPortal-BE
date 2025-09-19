import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateVehicleMaintenanceCommand } from './update-vehicle-maintenance.command';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

@CommandHandler(UpdateVehicleMaintenanceCommand)
export class UpdateVehicleMaintenanceCommandHandler
  implements ICommandHandler<UpdateVehicleMaintenanceCommand>
{
  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(command: UpdateVehicleMaintenanceCommand) {
    await this.maintenanceService.updateMaintenanceAsync(
      command.maintenanceId,
      command.updateMaintenanceDto,
    );
  }
}
