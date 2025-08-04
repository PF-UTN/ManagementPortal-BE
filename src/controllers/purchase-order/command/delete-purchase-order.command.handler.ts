import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeletePurchaseOrderCommand } from './delete-purchase-order.command';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

@CommandHandler(DeletePurchaseOrderCommand)
export class DeletePurchaseOrderCommandHandler
  implements ICommandHandler<DeletePurchaseOrderCommand>
{
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  async execute(command: DeletePurchaseOrderCommand) {
    await this.purchaseOrderService.deletePurchaseOrderAsync(
      command.purchaseOrderId,
    );
  }
}
