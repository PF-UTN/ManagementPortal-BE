import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateVehicleRepairCommand } from './update-vehicle-repair.command';
import { RepairService } from '../../../domain/service/repair/repair.service';

@CommandHandler(UpdateVehicleRepairCommand)
export class UpdateVehicleRepairCommandHandler
  implements ICommandHandler<UpdateVehicleRepairCommand>
{
  constructor(private readonly repairService: RepairService) {}

  async execute(command: UpdateVehicleRepairCommand) {
    await this.repairService.updateRepairAsync(
      command.repairId,
      command.updateRepairDto,
    );
  }
}
