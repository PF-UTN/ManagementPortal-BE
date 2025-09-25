import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { orderStatusTranslations } from '@mp/common/constants';
import { SearchOrderReturnDataDto, SearchOrderResponse } from '@mp/common/dtos';

import { SearchOrderQuery } from './search-order.query';
import { OrderService } from '../../../../src/domain/service/order/order.service';

@QueryHandler(SearchOrderQuery)
export class SearchOrderQueryHandler
  implements IQueryHandler<SearchOrderQuery>
{
  constructor(private readonly orderService: OrderService) {}

  async execute(query: SearchOrderQuery): Promise<SearchOrderResponse> {
    const { data, total } =
      await this.orderService.searchWithFiltersAsync(query);

    const mappedResponse = data.map((order): SearchOrderReturnDataDto => {
      return {
        id: order.id,
        clientName: order.client.companyName,
        orderStatus: orderStatusTranslations[order.orderStatus.name],
        createdAt: order.createdAt,
        totalAmount: order.totalAmount.toNumber(),
      };
    });

    return new SearchOrderResponse({
      total,
      results: mappedResponse,
    });
  }
}
