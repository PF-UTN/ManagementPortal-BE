import { QueryHandler } from '@nestjs/cqrs';

import { OrderDetailsDto } from '@mp/common/dtos';

import { OrderService } from './../../../domain/service/order/order.service';
import { GetOrderByIdQuery } from './get-order-by-id.query';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdQueryHandler {
  constructor(private readonly orderService: OrderService) {}

  async execute(query: GetOrderByIdQuery): Promise<OrderDetailsDto> {
    return this.orderService.findOrderByIdAsync(query.id);
  }
}
