import { Command } from '@nestjs/cqrs';

import { OrderCreationDto } from '@mp/common/dtos';

export class CreateOrderCommand extends Command<void> {
  constructor(public readonly orderCreationDto: OrderCreationDto) {
    super();
  }
}
