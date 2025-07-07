import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteVehicleCommand } from './delete-vehicle.command';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

@CommandHandler(DeleteVehicleCommand)
export class DeleteVehicleCommandHandler
  implements ICommandHandler<DeleteVehicleCommand>
{
  constructor(private readonly vehicleService: VehicleService) {}

  async execute(command: DeleteVehicleCommand) {
    await this.vehicleService.deleteVehicleAsync(
      command.vehicleId,
    );
  }
}
