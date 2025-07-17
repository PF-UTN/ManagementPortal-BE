import { Command } from '@nestjs/cqrs';

import { RepairCreationDto, RepairDto } from '@mp/common/dtos';

export class CreateVehicleRepairCommand extends Command<RepairDto> {
  constructor(public readonly vehicleId: number, public readonly repairCreationDto: RepairCreationDto) {
    super();
  }
}
