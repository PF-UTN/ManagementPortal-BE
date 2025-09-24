import { QueryHandler } from '@nestjs/cqrs';

import { OrderDetailsToClientDto } from '@mp/common/dtos';

import { OrderService } from './../../../domain/service/order/order.service';
import { GetOrderByIdToClientQuery } from './get-order-by-id-to-client.query';

@QueryHandler(GetOrderByIdToClientQuery)
export class GetOrderByIdToClientQueryHandler {
  constructor(private readonly orderService: OrderService) {}

  async execute(
    query: GetOrderByIdToClientQuery,
  ): Promise<OrderDetailsToClientDto> {
    return this.orderService.findOrderByIdToClientAsync(query.id);
  }
}
