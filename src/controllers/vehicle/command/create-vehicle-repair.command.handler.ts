import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RepairDto } from '@mp/common/dtos';

import { CreateVehicleRepairCommand } from './create-vehicle-repair.command';
import { RepairService } from '../../../domain/service/repair/repair.service';

@CommandHandler(CreateVehicleRepairCommand)
export class CreateVehicleRepairCommandHandler
  implements ICommandHandler<CreateVehicleRepairCommand>
{
  constructor(private readonly repairService: RepairService) {}

  async execute(command: CreateVehicleRepairCommand) {
    const repair = await this.repairService.createRepairAsync(
      command.vehicleId,
      command.repairCreationDto,
    );

    const repairDto: RepairDto = {
      id: repair.id,
      date: repair.date,
      description: repair.description,
      kmPerformed: repair.kmPerformed,
      vehicleId: repair.vehicleId,
      serviceSupplierId: repair.serviceSupplierId,
    };

    return repairDto;
  }
}
