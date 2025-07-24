import { Command } from '@nestjs/cqrs';

import { PurchaseOrderCreationDto } from '@mp/common/dtos';

export class CreatePurchaseOrderCommand extends Command<void> {
  constructor(
    public readonly purchaseOrderCreationDto: PurchaseOrderCreationDto,
  ) {
    super();
  }
}
