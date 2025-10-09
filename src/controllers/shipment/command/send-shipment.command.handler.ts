import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SendShipmentCommand } from './send-shipment.command';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@CommandHandler(SendShipmentCommand)
export class SendShipmentCommandHandler
  implements ICommandHandler<SendShipmentCommand>
{
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(command: SendShipmentCommand) {
    const [routeUrl] = await Promise.all([
      this.shipmentService.getOrCreateShipmentRoute(command.id),
      this.shipmentService.sendShipmentAsync(command.id),
    ]);

    return { routeUrl };
  }
}
