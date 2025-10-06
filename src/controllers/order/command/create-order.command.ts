import { Command } from '@nestjs/cqrs';

import { CreateOrderResponseDto, OrderCreationDto } from '@mp/common/dtos';

export class CreateOrderCommand extends Command<CreateOrderResponseDto> {
  constructor(public readonly orderCreationDto: OrderCreationDto) {
    super();
  }
}
