import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteVehicleMaintenancePlanItemCommand } from './delete-vehicle-maintenance-plan-item.command';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

@CommandHandler(DeleteVehicleMaintenancePlanItemCommand)
export class DeleteVehicleMaintenancePlanItemCommandHandler
  implements ICommandHandler<DeleteVehicleMaintenancePlanItemCommand>
{
  constructor(private readonly maintenancePlanItemService: MaintenancePlanItemService) {}

  async execute(command: DeleteVehicleMaintenancePlanItemCommand) {
    await this.maintenancePlanItemService.deleteMaintenancePlanItemAsync(command.maintenancePlanItemId);
  }
}
