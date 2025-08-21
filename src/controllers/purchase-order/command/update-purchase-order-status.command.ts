import { Command } from '@nestjs/cqrs';

import { UpdatePurchaseOrderStatusRequestDto } from '@mp/common/dtos';

export class UpdatePurchaseOrderStatusCommand extends Command<void> {
  readonly observation?: string;
  readonly purchaseOrderStatusId: number;
  readonly effectiveDeliveryDate?: Date;

  constructor(
    public readonly purchaseOrderId: number,
    request: UpdatePurchaseOrderStatusRequestDto,
  ) {
    super();
    this.purchaseOrderStatusId = request.purchaseOrderStatusId;
    this.observation = request.observation;
    this.effectiveDeliveryDate = request.effectiveDeliveryDate;
  }
}
