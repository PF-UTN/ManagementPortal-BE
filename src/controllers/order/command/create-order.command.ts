import { Command } from '@nestjs/cqrs';

import { OrderBasicDto, OrderCreationDto } from '@mp/common/dtos';

export class CreateOrderCommand extends Command<OrderBasicDto> {
  constructor(public readonly orderCreationDto: OrderCreationDto) {
    super();
  }
}
