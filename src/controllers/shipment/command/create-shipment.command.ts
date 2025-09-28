import { Command } from '@nestjs/cqrs';

import { ShipmentCreationDto } from '@mp/common/dtos';

export class CreateShipmentCommand extends Command<void> {
  constructor(public readonly shipmentCreationDto: ShipmentCreationDto) {
    super();
  }
}
