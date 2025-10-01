import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrderStatusId } from '@mp/common/constants';

import { FinishShipmentCommand } from './finish-shipment.command';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@CommandHandler(FinishShipmentCommand)
export class FinishShipmentCommandHandler
  implements ICommandHandler<FinishShipmentCommand>
{
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(command: FinishShipmentCommand) {
    const allOrdersPendingOrFinished = command.finishShipmentDto.orders.every(
      (order) =>
        order.orderStatusId === OrderStatusId.Pending ||
        order.orderStatusId === OrderStatusId.Finished,
    );

    if (!allOrdersPendingOrFinished) {
      throw new BadRequestException(
        'New order status must be Pending or Finished.',
      );
    }

    await this.shipmentService.finishShipmentAsync(
      command.id,
      command.finishShipmentDto,
    );
  }
}
