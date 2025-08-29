import { Command } from '@nestjs/cqrs';

import { UpdateRepairDto } from '@mp/common/dtos';

export class UpdateVehicleRepairCommand extends Command<void> {
  constructor(
    public readonly repairId: number,
    public readonly updateRepairDto: UpdateRepairDto,
  ) {
    super();
  }
}
