import { Command } from '@nestjs/cqrs';
import { Vehicle } from '@prisma/client';

import { VehicleCreationDto } from '@mp/common/dtos';

export class CreateVehicleCommand extends Command<Vehicle> {
  constructor(
    public readonly vehicleCreationDto: VehicleCreationDto,
  ) {
    super();
  }
}
