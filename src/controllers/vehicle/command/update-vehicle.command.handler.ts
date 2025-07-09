import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateVehicleCommand } from './update-vehicle.command';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

@CommandHandler(UpdateVehicleCommand)
export class UpdateVehicleCommandHandler
  implements ICommandHandler<UpdateVehicleCommand>
{
  constructor(private readonly vehicleService: VehicleService) {}

  async execute(command: UpdateVehicleCommand) {
    await this.vehicleService.updateVehicleAsync(
      command.id,
      command.updateVehicleDto,
    );
  }
}
