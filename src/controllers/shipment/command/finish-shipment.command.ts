import { Command } from '@nestjs/cqrs';

import { FinishShipmentDto } from '@mp/common/dtos';

export class FinishShipmentCommand extends Command<void> {
  constructor(
    public readonly id: number,
    public readonly finishShipmentDto: FinishShipmentDto,
  ) {
    super();
  }
}
