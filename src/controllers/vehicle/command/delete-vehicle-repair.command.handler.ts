import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteVehicleRepairCommand } from './delete-vehicle-repair.command';
import { RepairService } from '../../../domain/service/repair/repair.service';

@CommandHandler(DeleteVehicleRepairCommand)
export class DeleteVehicleRepairCommandHandler
  implements ICommandHandler<DeleteVehicleRepairCommand>
{
  constructor(private readonly repairService: RepairService) {}

  async execute(command: DeleteVehicleRepairCommand) {
    await this.repairService.deleteRepairAsync(command.repairId);
  }
}
