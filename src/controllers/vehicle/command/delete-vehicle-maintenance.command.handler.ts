import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteVehicleMaintenanceCommand } from './delete-vehicle-maintenance.command';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

@CommandHandler(DeleteVehicleMaintenanceCommand)
export class DeleteVehicleMaintenanceCommandHandler
  implements ICommandHandler<DeleteVehicleMaintenanceCommand>
{
  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(command: DeleteVehicleMaintenanceCommand) {
    await this.maintenanceService.deleteMaintenanceAsync(command.maintenanceId);
  }
}
