import { Query } from '@nestjs/cqrs';

import { OrderDetailsToClientDto } from '@mp/common/dtos';
export class GetOrderByIdToClientQuery extends Query<OrderDetailsToClientDto> {
  constructor(public readonly id: number) {
    super();
  }
}
