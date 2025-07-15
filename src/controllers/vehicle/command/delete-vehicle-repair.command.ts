import { Command } from '@nestjs/cqrs';

export class DeleteVehicleRepairCommand extends Command<void> {
  constructor(public readonly repairId: number) {
    super();
  }
}
