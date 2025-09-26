import { Query } from '@nestjs/cqrs';

import { OrderDetailsDto } from '@mp/common/dtos';
export class GetOrderByIdQuery extends Query<OrderDetailsDto> {
  constructor(public readonly id: number) {
    super();
  }
}
