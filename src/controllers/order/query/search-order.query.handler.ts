import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { orderStatusTranslations } from '@mp/common/constants';
import {
  SearchOrderFromClientResponse,
  SearchOrderFromClientServiceDto,
} from '@mp/common/dtos';

import { OrderDto } from './../../../../libs/common/src/dtos/order/order.dto';
import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { OrderService } from './../../../domain/service/order/order.service';
import { SearchOrderFromClientQuery } from './search-order.query';

@QueryHandler(SearchOrderFromClientQuery)
export class SearchOrderQueryHandler
  implements IQueryHandler<SearchOrderFromClientQuery>
{
  constructor(
    private readonly orderService: OrderService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(
    query: SearchOrderFromClientQuery,
  ): Promise<SearchOrderFromClientResponse> {
    const token = query.authorizationHeader.split(' ')[1];
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;

    const queryToService: SearchOrderFromClientServiceDto = {
      clientId: userId,
      searchText: query.searchText,
      page: query.page,
      pageSize: query.pageSize,
      filters: query.filters,
      orderBy: query.orderBy,
    };
    const { data, total } =
      await this.orderService.searchClientOrdersWithFiltersAsync(
        queryToService,
      );

    const mappedResponse = data.map((order): OrderDto => {
      return {
        id: order.id,
        orderStatusName: orderStatusTranslations[order.orderStatus.name],
        createdAt: order.createdAt,
        totalAmount: order.totalAmount.toNumber(),
        productsCount: order.orderItems.length,
      };
    });

    return new SearchOrderFromClientResponse({
      total,
      results: mappedResponse,
    });
  }
}
