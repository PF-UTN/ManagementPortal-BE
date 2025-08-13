import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdatePurchaseOrderCommand } from './update-purchase-order.command';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

@CommandHandler(UpdatePurchaseOrderCommand)
export class UpdatePurchaseOrderCommandHandler
  implements ICommandHandler<UpdatePurchaseOrderCommand>
{
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  async execute(command: UpdatePurchaseOrderCommand) {
    await this.purchaseOrderService.updatePurchaseOrderAsync(
      command.id,
      command.purchaseOrderUpdateDto,
    );
  }
}
