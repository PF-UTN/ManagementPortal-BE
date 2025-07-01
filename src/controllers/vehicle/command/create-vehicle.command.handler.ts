import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VehicleDto } from '@mp/common/dtos';

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

    const vehicleDto: VehicleDto = {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      kmTraveled: vehicle.kmTraveled,
      admissionDate: vehicle.admissionDate,
      enabled: vehicle.enabled,
    };
    return vehicleDto;
  }
}
