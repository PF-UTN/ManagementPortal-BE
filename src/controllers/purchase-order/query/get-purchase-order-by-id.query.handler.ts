import { QueryHandler } from '@nestjs/cqrs';

import { PurchaseOrderDetailsDto } from '@mp/common/dtos';

import { GetPurchaseOrderByIdQuery } from './get-purchase-order-by-id.query';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

@QueryHandler(GetPurchaseOrderByIdQuery)
export class GetPurchaseOrderByIdQueryHandler {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  async execute(
    query: GetPurchaseOrderByIdQuery,
  ): Promise<PurchaseOrderDetailsDto> {
    return this.purchaseOrderService.findPurchaseOrderByIdAsync(query.id);
  }
}
