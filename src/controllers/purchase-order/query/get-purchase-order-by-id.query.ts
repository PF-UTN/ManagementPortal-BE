import { Query } from '@nestjs/cqrs';

import { PurchaseOrderDetailsDto } from '@mp/common/dtos';
export class GetPurchaseOrderByIdQuery extends Query<PurchaseOrderDetailsDto> {
  constructor(public readonly id: number) {
    super();
  }
}
