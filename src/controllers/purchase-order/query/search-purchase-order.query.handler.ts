import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PurchaseOrderDto, SearchPurchaseOrderResponse } from '@mp/common/dtos';

import { SearchPurchaseOrderQuery } from './search-purchase-order.query';
import { PurchaseOrderService } from '../../../../src/domain/service/purchase-order/purchase-order.service';

@QueryHandler(SearchPurchaseOrderQuery)
export class SearchPurchaseOrderQueryHandler
    implements IQueryHandler<SearchPurchaseOrderQuery> {
    constructor(private readonly purchaseOrderService: PurchaseOrderService) { }

    async execute(
        query: SearchPurchaseOrderQuery,
    ): Promise<SearchPurchaseOrderResponse> {
        const { data, total } =
            await this.purchaseOrderService.searchWithFiltersAsync(query);

        const mappedResponse = data.map((purchaseOrder): PurchaseOrderDto => {
            return {
                id: purchaseOrder.id,
                supplierBussinesName: purchaseOrder.supplier.businessName,
                purchaseOrderStatusName: purchaseOrder.purchaseOrderStatus.name,
                createdAt: purchaseOrder.createdAt,
                effectiveDeliveryDate: purchaseOrder.effectiveDeliveryDate ?? null,
                totalAmount: purchaseOrder.totalAmount.toNumber(),
            };
        });

        return new SearchPurchaseOrderResponse({
            total,
            results: mappedResponse,
        });
    }
}
