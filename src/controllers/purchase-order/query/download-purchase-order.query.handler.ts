import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DownloadPurchaseOrderDto } from '@mp/common/dtos';

import { DownloadPurchaseOrderQuery } from './download-purchase-order.query';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

@QueryHandler(DownloadPurchaseOrderQuery)
export class DownloadPurchaseOrderQueryHandler
  implements IQueryHandler<DownloadPurchaseOrderQuery>
{
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  async execute(
    query: DownloadPurchaseOrderQuery,
  ): Promise<DownloadPurchaseOrderDto[]> {
    const data =
      await this.purchaseOrderService.downloadWithFiltersAsync(query);

    return data.map((order): DownloadPurchaseOrderDto => {
      return {
        ID: order.id,
        Estado: order.purchaseOrderStatus.name,
        Proveedor: order.supplier.businessName,
        Fecha_Creacion: order.createdAt,
        Fecha_Entrega_Estimada: order.estimatedDeliveryDate,
        Fecha_Entrega_Efectiva: order.effectiveDeliveryDate,
        Observacion: order.observation,
        Monto_Total: order.totalAmount.toNumber(),
        Productos: JSON.stringify(
          order.purchaseOrderItems.map((item) => ({
            ID: item.id,
            Producto: item.product.name,
            Precio_Unitario: item.unitPrice,
            Cantidad: item.quantity,
            Subtotal: item.subtotalPrice,
          })),
        ),
      };
    });
  }
}
