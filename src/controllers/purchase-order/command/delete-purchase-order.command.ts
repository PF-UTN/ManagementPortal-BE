import { Command } from '@nestjs/cqrs';

export class DeletePurchaseOrderCommand extends Command<void> {
  constructor(public readonly purchaseOrderId: number) {
    super();
  }
}
