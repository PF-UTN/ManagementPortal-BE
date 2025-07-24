import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreatePurchaseOrderCommand } from './create-purchase-order.command';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

@CommandHandler(CreatePurchaseOrderCommand)
export class CreatePurchaseOrderCommandHandler
  implements ICommandHandler<CreatePurchaseOrderCommand>
{
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  async execute(command: CreatePurchaseOrderCommand) {
    await this.purchaseOrderService.createPurchaseOrderAsync(
      command.purchaseOrderCreationDto,
    );
  }
}
