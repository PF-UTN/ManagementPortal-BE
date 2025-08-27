import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdatePurchaseOrderStatusCommand } from './update-purchase-order-status.command';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

@CommandHandler(UpdatePurchaseOrderStatusCommand)
export class UpdatePurchaseOrderStatusCommandHandler
  implements ICommandHandler<UpdatePurchaseOrderStatusCommand>
{
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  async execute(command: UpdatePurchaseOrderStatusCommand) {
    await this.purchaseOrderService.updatePurchaseOrderStatusAsync(
      command.purchaseOrderId,
      command.purchaseOrderStatusId,
      command.observation,
      command.effectiveDeliveryDate,
    );
  }
}
