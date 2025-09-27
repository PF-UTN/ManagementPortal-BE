import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrderService } from './../../../domain/service/order/order.service';
import { UpdateOrderStatusCommand } from './update-order-status.command';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusCommandHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  constructor(private readonly orderService: OrderService) {}

  async execute(command: UpdateOrderStatusCommand) {
    await this.orderService.updateOrderStatusAsync(
      command.orderId,
      command.orderStatusId,
    );
  }
}
