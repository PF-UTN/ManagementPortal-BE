import { Command } from '@nestjs/cqrs';

import { UpdateOrderStatusRequestDto } from '@mp/common/dtos';

export class UpdateOrderStatusCommand extends Command<void> {
  readonly orderStatusId: number;

  constructor(
    public readonly orderId: number,
    request: UpdateOrderStatusRequestDto,
  ) {
    super();
    this.orderStatusId = request.orderStatusId;
  }
}
