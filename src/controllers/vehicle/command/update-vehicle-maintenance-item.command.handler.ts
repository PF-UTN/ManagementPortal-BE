import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateVehicleMaintenanceItemCommand } from './update-vehicle-maintenance-item.command';
import { MaintenanceItemService } from '../../../domain/service/maintenance-item/maintenance-item.service';

@CommandHandler(UpdateVehicleMaintenanceItemCommand)
export class UpdateVehicleMaintenanceItemCommandHandler
  implements ICommandHandler<UpdateVehicleMaintenanceItemCommand>
{
  constructor(
    private readonly maintenanceItemService: MaintenanceItemService,
  ) {}

  async execute(command: UpdateVehicleMaintenanceItemCommand) {
    await this.maintenanceItemService.updateMaintenanceItemAsync(
      command.maintenanceItemId,
      command.updateMaintenanceItemDto,
    );
  }
}
