import { Query } from '@nestjs/cqrs';

import { OrderDetailsToClientDto } from '@mp/common/dtos';
export class GetOrderByIdForClientQuery extends Query<OrderDetailsToClientDto> {
  constructor(
    public readonly id: number,
    public readonly authorizationHeader: string,
  ) {
    super();
  }
}
