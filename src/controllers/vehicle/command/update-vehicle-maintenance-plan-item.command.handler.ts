import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateVehicleMaintenancePlanItemCommand } from './update-vehicle-maintenance-plan-item.command';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

@CommandHandler(UpdateVehicleMaintenancePlanItemCommand)
export class UpdateVehicleMaintenancePlanItemCommandHandler
  implements ICommandHandler<UpdateVehicleMaintenancePlanItemCommand>
{
  constructor(
    private readonly maintenancePlanItemService: MaintenancePlanItemService,
  ) {}

  async execute(command: UpdateVehicleMaintenancePlanItemCommand) {
    if (
      !command.updateMaintenancePlanItemDto.kmInterval &&
      !command.updateMaintenancePlanItemDto.timeInterval
    ) {
      throw new BadRequestException(
        `At least one of kmInterval or timeInterval must be provided.`,
      );
    }
    await this.maintenancePlanItemService.updateMaintenancePlanItemAsync(
      command.maintenancePlanItemId,
      command.updateMaintenancePlanItemDto,
    );
  }
}
