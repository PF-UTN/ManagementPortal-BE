import { Command } from '@nestjs/cqrs';

export class DeleteVehicleCommand extends Command<void> {
  constructor(public readonly vehicleId: number) {
    super();
  }
}
