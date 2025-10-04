import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrderBasicDto } from '@mp/common/dtos';

import { OrderService } from './../../../domain/service/order/order.service';
import { CreateOrderCommand } from './create-order.command';
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler
  implements ICommandHandler<CreateOrderCommand>
{
  constructor(private readonly orderService: OrderService) {}

  async execute(command: CreateOrderCommand): Promise<OrderBasicDto> {
    const order = await this.orderService.createOrderAsync(
      command.orderCreationDto,
    );
    return order;
  }
}
