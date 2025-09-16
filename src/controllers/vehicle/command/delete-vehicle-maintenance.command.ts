import { Command } from '@nestjs/cqrs';

export class DeleteVehicleMaintenanceCommand extends Command<void> {
  constructor(public readonly maintenanceId: number) {
    super();
  }
}
