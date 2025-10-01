import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SendShipmentCommand } from './send-shipment.command';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@CommandHandler(SendShipmentCommand)
export class SendShipmentCommandHandler
  implements ICommandHandler<SendShipmentCommand>
{
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(command: SendShipmentCommand) {
    await this.shipmentService.sendShipmentAsync(command.id);
  }
}
