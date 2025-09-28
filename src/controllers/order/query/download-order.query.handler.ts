import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { orderStatusTranslations } from '@mp/common/constants';
import { DownloadOrderDto } from '@mp/common/dtos';

import { DownloadOrderQuery } from './download-order.query';
import { OrderService } from '../../../domain/service/order/order.service';

@QueryHandler(DownloadOrderQuery)
export class DownloadOrderQueryHandler
  implements IQueryHandler<DownloadOrderQuery>
{
  constructor(private readonly orderService: OrderService) {}

  async execute(query: DownloadOrderQuery): Promise<DownloadOrderDto[]> {
    const data = await this.orderService.downloadWithFiltersAsync(query);

    return data.map((order): DownloadOrderDto => {
      return {
        ID: order.id,
        Cliente: order.client.companyName,
        Estado: orderStatusTranslations[order.orderStatus.name],
        Fecha_Creacion: order.createdAt,
        Monto_Total: Number(order.totalAmount),
      };
    });
  }
}
