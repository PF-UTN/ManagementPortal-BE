import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SearchPurchaseOrderQuery } from 'src/controllers/purchase-order/query/search-purchase-order.query';

import { PurchaseOrderStatusId } from '@mp/common/constants';
import { PurchaseOrderCreationDto } from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
} from '@mp/repository';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly unitOfWork: PrismaUnitOfWork,
  ) {}

  async createPurchaseOrderAsync(
    purchaseOrderCreationDto: PurchaseOrderCreationDto,
  ) {
    const { purchaseOrderItems, ...purchaseOrderData } =
      purchaseOrderCreationDto;

    if (!purchaseOrderItems || purchaseOrderItems.length === 0) {
      throw new BadRequestException(
        'Purchase order must have at least one item',
      );
    }

    const productIds = purchaseOrderItems.map((item) => item.productId);

    const productsExist =
      await this.productRepository.existsManyAsync(productIds);
    if (!productsExist) {
      throw new NotFoundException(`One or more products do not exist.`);
    }

    const totalAmount = purchaseOrderItems.reduce((sum, item) => {
      return sum + item.quantity * Number(item.unitPrice);
    }, 0);

    return this.unitOfWork.execute(async (tx) => {
      const purchaseOrder =
        await this.purchaseOrderRepository.createPurchaseOrderAsync(
          {
            ...purchaseOrderData,
            totalAmount,
            purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
          },
          tx,
        );

      const purchaseOrderItemsToCreate = purchaseOrderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotalPrice: item.quantity * Number(item.unitPrice),
        purchaseOrderId: purchaseOrder.id,
      }));

      await this.purchaseOrderItemRepository.createManyPurchaseOrderItemAsync(
        purchaseOrderItemsToCreate,
        tx,
      );
    });
  }

  async searchWithFiltersAsync(query: SearchPurchaseOrderQuery) {
    return this.purchaseOrderRepository.searchWithFiltersAsync(
      query.page,
      query.pageSize,
      query.searchText,
      query.filters,
      query.orderBy,
    );
  }
}
