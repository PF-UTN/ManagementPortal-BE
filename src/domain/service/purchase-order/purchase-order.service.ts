import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PurchaseOrder } from '@prisma/client';
import { isEqual } from 'lodash';

import {
  canTransition,
  PurchaseOrderStatusId,
  purchaseOrderStatusTranslations,
  StockChangedField,
  StockChangeTypeIds,
} from '@mp/common/constants';
import {
  PurchaseOrderCreationDto,
  PurchaseOrderDetailsDto,
  PurchaseOrderItemDetailsDto,
  PurchaseOrderItemDto,
  PurchaseOrderUpdateDto,
  StockChangeCreationDataDto,
  StockDto,
} from '@mp/common/dtos';
import { calculateTotalAmount } from '@mp/common/helpers';
import {
  PrismaUnitOfWork,
  ProductRepository,
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
  StockChangeRepository,
} from '@mp/repository';

import { StockService } from '../stock/stock.service';
import { SearchPurchaseOrderQuery } from './../../../controllers/purchase-order/query/search-purchase-order.query';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly stockService: StockService,
    private readonly stockChangeRepository: StockChangeRepository,
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

  async findPurchaseOrderByIdAsync(
    id: number,
  ): Promise<PurchaseOrderDetailsDto> {
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

  async deletePurchaseOrderAsync(id: number) {
    const purchaseOrder = await this.purchaseOrderRepository.findByIdAsync(id);

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Purchase order with id ${id} does not exist.`,
      );
    }

    if (
      purchaseOrder.purchaseOrderStatusId === PurchaseOrderStatusId.Ordered ||
      purchaseOrder.purchaseOrderStatusId === PurchaseOrderStatusId.Received
    ) {
      throw new BadRequestException(
        `Purchase order with id ${id} cannot be deleted because it is in an active state.`,
      );
    }

    return await this.purchaseOrderRepository.deletePurchaseOrderAsync(id);
  }

  async updatePurchaseOrderStatusAsync(
    id: number,
    newStatus: PurchaseOrderStatusId,
    observation?: string,
    effectiveDeliveryDate?: Date,
  ) {
    const purchaseOrder = await this.purchaseOrderRepository.findByIdAsync(id);
    if (!purchaseOrder) {
      throw new NotFoundException(
        `Purchase order with id ${id} does not exist.`,
      );
    }

    const currentStatus = purchaseOrder.purchaseOrderStatusId;

    const validTransition = canTransition(currentStatus, newStatus);
    if (!validTransition) {
      throw new BadRequestException(
        `Invalid status transition from ${PurchaseOrderStatusId[currentStatus]} to ${PurchaseOrderStatusId[newStatus]}`,
      );
    }

    if (newStatus === PurchaseOrderStatusId.Cancelled && !observation) {
      throw new BadRequestException(
        'Observation is required when cancelling a purchase order.',
      );
    }

    if (
      newStatus === PurchaseOrderStatusId.Received &&
      !effectiveDeliveryDate
    ) {
      throw new BadRequestException(
        'Effective delivery date is required when receiving a purchase order.',
      );
    }

    return this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      await this.manageStockChanges(
        purchaseOrder,
        purchaseOrder.purchaseOrderItems,
        newStatus,
        tx,
      );

      return this.purchaseOrderRepository.updatePurchaseOrderAsync(
        purchaseOrder.id,
        {
          purchaseOrderStatus: { connect: { id: newStatus } },
          observation: observation ?? purchaseOrder.observation,
          effectiveDeliveryDate:
            effectiveDeliveryDate ?? purchaseOrder.effectiveDeliveryDate,
        },
        tx,
      );
    });
  }

  async updatePurchaseOrderAsync(
    id: number,
    purchaseOrderUpdateDto: PurchaseOrderUpdateDto,
  ) {
    const purchaseOrder = await this.purchaseOrderRepository.findByIdAsync(id);
    if (!purchaseOrder) {
      throw new NotFoundException(
        `Purchase order with id ${id} does not exist.`,
      );
    }

    if (purchaseOrderUpdateDto.purchaseOrderItems.length === 0) {
      throw new BadRequestException('At least one item must be provided.');
    }

    const currentPurchaseOrderStatus = purchaseOrder.purchaseOrderStatusId;
    const newPurchaseOrderStatus = purchaseOrderUpdateDto.purchaseOrderStatusId;

    if (currentPurchaseOrderStatus !== newPurchaseOrderStatus) {
      const validTransition = canTransition(
        currentPurchaseOrderStatus,
        newPurchaseOrderStatus,
      );
      if (!validTransition) {
        throw new BadRequestException(
          `Invalid status transition from ${PurchaseOrderStatusId[currentPurchaseOrderStatus]} to ${PurchaseOrderStatusId[newPurchaseOrderStatus]}`,
        );
      }
    }

    if (
      newPurchaseOrderStatus === PurchaseOrderStatusId.Cancelled &&
      !purchaseOrderUpdateDto.observation
    ) {
      throw new BadRequestException(
        'Observation is required when cancelling a purchase order.',
      );
    }

    if (
      newPurchaseOrderStatus === PurchaseOrderStatusId.Received &&
      !purchaseOrderUpdateDto.effectiveDeliveryDate
    ) {
      throw new BadRequestException(
        'Effective delivery date is required when receiving a purchase order.',
      );
    }

    const { purchaseOrderItems, ...purchaseOrderUpdateData } =
      purchaseOrderUpdateDto;

    const currentPurchaseOrderItems =
      this.purchaseOrderItemRepository.findByPurchaseOrderIdAsync(
        purchaseOrder.id,
      );

    const transformedItems: PurchaseOrderItemDto[] = (
      await currentPurchaseOrderItems
    ).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    }));

    const newPurchaseOrderItemsToCreate = purchaseOrderItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      purchaseOrderId: purchaseOrder.id,
      subtotalPrice: Number(item.unitPrice) * item.quantity,
    }));

    const totalAmount = calculateTotalAmount(newPurchaseOrderItemsToCreate);

    this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      if (!isEqual(purchaseOrderItems, transformedItems)) {
        await this.purchaseOrderItemRepository.deleteByPurchaseOrderIdAsync(
          purchaseOrder.id,
          tx,
        );
        await this.purchaseOrderItemRepository.createManyPurchaseOrderItemAsync(
          newPurchaseOrderItemsToCreate,
          tx,
        );
        await this.manageStockChanges(
          purchaseOrder,
          newPurchaseOrderItemsToCreate,
          purchaseOrderUpdateDto.purchaseOrderStatusId,
          tx,
        );
      }

      await this.purchaseOrderRepository.updatePurchaseOrderAsync(
        purchaseOrder.id,
        { ...purchaseOrderUpdateData, totalAmount },
        tx,
      );
    });
  }

  private async manageStockChanges(
    purchaseOrder: PurchaseOrder,
    purchaseOrderItems: { productId: number; quantity: number }[],
    newStatus: PurchaseOrderStatusId,
    tx: Prisma.TransactionClient,
  ) {
    const stockUpdates: StockChangeCreationDataDto[] = [];

    switch (newStatus) {
      case PurchaseOrderStatusId.Received: {
        const stocks = await Promise.all(
          purchaseOrderItems.map((item) =>
            this.stockService.findByProductIdAsync(item.productId, tx),
          ),
        );

        const updatePromises = purchaseOrderItems.map((item, index) => {
          const stock = stocks[index];
          if (!stock) {
            throw new NotFoundException(
              `Stock for product ${item.productId} not found.`,
            );
          }

          const newStock: StockDto = {
            quantityAvailable: stock.quantityAvailable + item.quantity,
            quantityOrdered: stock.quantityOrdered - item.quantity,
            quantityReserved: stock.quantityReserved,
          };

          stockUpdates.push(
            {
              productId: item.productId,
              changeTypeId: StockChangeTypeIds.Income,
              changedField: StockChangedField.QuantityAvailable,
              previousValue: stock.quantityAvailable,
              newValue: newStock.quantityAvailable,
              reason: `Purchase order ${purchaseOrder.id} received`,
            },
            {
              productId: item.productId,
              changeTypeId: StockChangeTypeIds.Outcome,
              changedField: StockChangedField.QuantityOrdered,
              previousValue: stock.quantityOrdered,
              newValue: newStock.quantityOrdered,
              reason: `Purchase order ${purchaseOrder.id} received`,
            },
          );

          return this.stockService.updateStockByProductIdAsync(
            stock.productId,
            newStock,
            tx,
          );
        });

        await Promise.all(updatePromises);
        await this.stockChangeRepository.createManyStockChangeAsync(
          stockUpdates,
          tx,
        );
        break;
      }

      case PurchaseOrderStatusId.Cancelled: {
        if (purchaseOrder.purchaseOrderStatusId === PurchaseOrderStatusId.Draft)
          break;

        const stocks = await Promise.all(
          purchaseOrderItems.map((item) =>
            this.stockService.findByProductIdAsync(item.productId, tx),
          ),
        );

        const updatePromises = purchaseOrderItems.map((item, index) => {
          const stock = stocks[index];
          if (!stock) {
            throw new NotFoundException(
              `Stock for product ${item.productId} not found.`,
            );
          }

          const newStock: StockDto = {
            quantityAvailable: stock.quantityAvailable,
            quantityOrdered: stock.quantityOrdered - item.quantity,
            quantityReserved: stock.quantityReserved,
          };

          stockUpdates.push({
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Outcome,
            changedField: StockChangedField.QuantityOrdered,
            previousValue: stock.quantityOrdered,
            newValue: newStock.quantityOrdered,
            reason: `Purchase order ${purchaseOrder.id} cancelled`,
          });

          return this.stockService.updateStockByProductIdAsync(
            stock.productId,
            newStock,
            tx,
          );
        });

        await Promise.all(updatePromises);
        await this.stockChangeRepository.createManyStockChangeAsync(
          stockUpdates,
          tx,
        );
        break;
      }

      case PurchaseOrderStatusId.Ordered: {
        const stocks = await Promise.all(
          purchaseOrderItems.map((item) =>
            this.stockService.findByProductIdAsync(item.productId, tx),
          ),
        );

        const updatePromises = purchaseOrderItems.map((item, index) => {
          const stock = stocks[index];
          if (!stock) {
            throw new NotFoundException(
              `Stock for product ${item.productId} not found.`,
            );
          }

          const newStock: StockDto = {
            quantityAvailable: stock.quantityAvailable,
            quantityOrdered: stock.quantityOrdered + item.quantity,
            quantityReserved: stock.quantityReserved,
          };

          stockUpdates.push({
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Income,
            changedField: StockChangedField.QuantityOrdered,
            previousValue: stock.quantityOrdered,
            newValue: newStock.quantityOrdered,
            reason: `Purchase order ${purchaseOrder.id} ordered`,
          });

          return this.stockService.updateStockByProductIdAsync(
            stock.productId,
            newStock,
            tx,
          );
        });

        await Promise.all(updatePromises);
        await this.stockChangeRepository.createManyStockChangeAsync(
          stockUpdates,
          tx,
        );
        break;
      }

      case PurchaseOrderStatusId.Deleted:
      default:
        break;
    }
  }
}
