import { Command } from '@nestjs/cqrs';

import { PurchaseOrderUpdateDto } from '@mp/common/dtos';

export class UpdatePurchaseOrderCommand extends Command<void> {
  constructor(
    public readonly id: number,
    public readonly purchaseOrderUpdateDto: PurchaseOrderUpdateDto,
  ) {
    super();
  }
}
