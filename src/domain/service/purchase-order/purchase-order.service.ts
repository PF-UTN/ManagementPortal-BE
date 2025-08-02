import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PurchaseOrderStatusId,
  purchaseOrderStatusTranslations,
} from '@mp/common/constants';
import {
  PurchaseOrderCreationDto,
  PurchaseOrderDetailsDto,
  PurchaseOrderItemDetailsDto,
} from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
} from '@mp/repository';

import { SearchPurchaseOrderQuery } from './../../../controllers/purchase-order/query/search-purchase-order.query';

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

  async findPurchaseOrderByIdAsync(id: number): Promise<PurchaseOrderDetailsDto> {
    const purchaseOrder =
      await this.purchaseOrderRepository.findByIdWithSupplierAndStatusAsync(id);
    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    const items =
      await this.purchaseOrderItemRepository.findByPurchaseOrderIdAsync(id);

    const itemDtos: PurchaseOrderItemDetailsDto[] = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotalPrice: Number(item.unitPrice) * item.quantity,
    }));

    const totalAmount = itemDtos.reduce(
      (sum, item) => sum + item.subtotalPrice,
      0,
    );

    const orderDto: PurchaseOrderDetailsDto = {
      id: purchaseOrder.id,
      createdAt: purchaseOrder.createdAt,
      estimatedDeliveryDate: purchaseOrder.estimatedDeliveryDate,
      effectiveDeliveryDate: purchaseOrder.effectiveDeliveryDate,
      observation: purchaseOrder.observation,
      totalAmount,
      status: {
        id: purchaseOrder.purchaseOrderStatus.id,
        name:
          purchaseOrderStatusTranslations[
            purchaseOrder.purchaseOrderStatus.name
          ] || purchaseOrder.purchaseOrderStatus.name,
      },
      supplier: purchaseOrder.supplier.businessName,
      purchaseOrderItems: itemDtos,
    };

    return orderDto;
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
