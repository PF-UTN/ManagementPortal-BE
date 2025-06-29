import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateVehicleCommand } from './create-vehicle.command';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

@CommandHandler(CreateVehicleCommand)
export class CreateVehicleCommandHandler
  implements ICommandHandler<CreateVehicleCommand>
{
  constructor(private readonly vehicleService: VehicleService) {}

  async execute(command: CreateVehicleCommand) {
    const vehicle = await this.vehicleService.createVehicleAsync(
      command.vehicleCreationDto,
    );
    return vehicle;
  }
}
