import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateOrderResponseDto } from '@mp/common/dtos';

import { OrderService } from './../../../domain/service/order/order.service';
import { CreateOrderCommand } from './create-order.command';
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler
  implements ICommandHandler<CreateOrderCommand>
{
  constructor(private readonly orderService: OrderService) {}

  async execute(command: CreateOrderCommand): Promise<CreateOrderResponseDto> {
    const orderId = await this.orderService.createOrderAsync(
      command.orderCreationDto,
    );
    const createOrderResponse: CreateOrderResponseDto = { id: orderId };
    return createOrderResponse;
  }
}
