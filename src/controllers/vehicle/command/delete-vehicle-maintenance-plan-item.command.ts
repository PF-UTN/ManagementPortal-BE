import { Command } from '@nestjs/cqrs';

export class DeleteVehicleMaintenancePlanItemCommand extends Command<void> {
  constructor(public readonly maintenancePlanItemId: number) {
    super();
  }
}
