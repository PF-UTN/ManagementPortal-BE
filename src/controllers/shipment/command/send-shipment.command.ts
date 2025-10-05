import { Command } from '@nestjs/cqrs';

import { SendShipmentResponse } from '@mp/common/dtos';

export class SendShipmentCommand extends Command<SendShipmentResponse> {
  constructor(public readonly id: number) {
    super();
  }
}
