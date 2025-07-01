import { Command } from '@nestjs/cqrs';

import { VehicleCreationDto, VehicleDto } from '@mp/common/dtos';

export class CreateVehicleCommand extends Command<VehicleDto> {
  constructor(
    public readonly vehicleCreationDto: VehicleCreationDto,
  ) {
    super();
  }
}
