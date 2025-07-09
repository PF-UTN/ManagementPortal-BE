import { Command } from '@nestjs/cqrs';

import { UpdateVehicleDto } from '@mp/common/dtos';

export class UpdateVehicleCommand extends Command<void> {
  constructor(
    public readonly id: number,
    public readonly updateVehicleDto: UpdateVehicleDto,
  ) {
    super();
  }
}
