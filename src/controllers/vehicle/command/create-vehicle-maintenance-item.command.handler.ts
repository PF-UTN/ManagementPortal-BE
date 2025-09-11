import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateVehicleMaintenanceItemCommand } from './create-vehicle-maintenance-item.command';
import { MaintenanceItemService } from '../../../domain/service/maintenance-item/maintenance-item.service';

@CommandHandler(CreateVehicleMaintenanceItemCommand)
export class CreateVehicleMaintenanceItemCommandHandler
  implements ICommandHandler<CreateVehicleMaintenanceItemCommand>
{
  constructor(
    private readonly maintenanceItemService: MaintenanceItemService,
  ) {}

  async execute(command: CreateVehicleMaintenanceItemCommand) {
    await this.maintenanceItemService.createMaintenanceItemAsync(
      command.maintenanceItemCreationDto,
    );
  }
}
