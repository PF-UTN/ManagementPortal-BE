import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateVehicleMaintenancePlanItemCommand } from './create-vehicle-maintenance-plan-item.command';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

@CommandHandler(CreateVehicleMaintenancePlanItemCommand)
export class CreateVehicleMaintenancePlanItemCommandHandler
  implements ICommandHandler<CreateVehicleMaintenancePlanItemCommand>
{
  constructor(
    private readonly maintenancePlanItemService: MaintenancePlanItemService,
  ) {}

  async execute(command: CreateVehicleMaintenancePlanItemCommand) {
    if (
      !command.maintenancePlanItemCreationDto.kmInterval &&
      !command.maintenancePlanItemCreationDto.timeInterval
    ) {
      throw new BadRequestException(
        `At least one of kmInterval or timeInterval must be provided.`,
      );
    }
    await this.maintenancePlanItemService.createMaintenancePlanItemAsync(
      command.maintenancePlanItemCreationDto,
    );
  }
}
