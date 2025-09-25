import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { OrderDetailsToClientDto } from '@mp/common/dtos';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { ClientService } from './../../../domain/service/client/client.service';
import { OrderService } from './../../../domain/service/order/order.service';
import { GetOrderByIdForClientQuery } from './get-order-by-id-to-client.query';

@QueryHandler(GetOrderByIdForClientQuery)
export class GetOrderByIdToClientQueryHandler {
  constructor(
    private readonly orderService: OrderService,
    private readonly authenticationService: AuthenticationService,
    private readonly clientService: ClientService,
  ) {}

  async execute(
    query: GetOrderByIdForClientQuery,
  ): Promise<OrderDetailsToClientDto> {
    const token = query.authorizationHeader.split(' ')[1];
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;

    const client = await this.clientService.findClientByUserIdAsync(userId);
    if (!client) {
      throw new NotFoundException('Client associated with user not found');
    }

    return this.orderService.findOrderByIdForClientAsync(query.id, client.id);
  }
}
