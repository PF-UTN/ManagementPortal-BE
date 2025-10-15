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
  PurchaseOrderItemCreationDto,
  PurchaseOrderItemDetailsDto,
  PurchaseOrderItemDto,
  PurchaseOrderReportGenerationDataDto,
  PurchaseOrderUpdateDto,
  StockChangeCreationDataDto,
  StockDto,
} from '@mp/common/dtos';
import { calculateTotalAmount, pdfToBuffer } from '@mp/common/helpers';
import {
  MailingService,
  purchaseOrderHtmlReport,
  ReportService,
} from '@mp/common/services';
import {
  PrismaUnitOfWork,
  ProductRepository,
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
  StockChangeRepository,
  SupplierRepository,
} from '@mp/repository';

import { DownloadPurchaseOrderQuery } from '../../../controllers/purchase-order/query/download-purchase-order.query';
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
    private readonly supplierRepository: SupplierRepository,
    private readonly unitOfWork: PrismaUnitOfWork,
    private readonly mailingService: MailingService,
    private readonly reportService: ReportService,
  ) {}

  async createPurchaseOrderAsync(
    purchaseOrderCreationDto: PurchaseOrderCreationDto,
  ) {
    const { purchaseOrderItems, ...purchaseOrderData } =
      purchaseOrderCreationDto;

    if (
      purchaseOrderData.purchaseOrderStatusId !==
        PurchaseOrderStatusId.Ordered &&
      purchaseOrderData.purchaseOrderStatusId !== PurchaseOrderStatusId.Draft
    ) {
      throw new BadRequestException(
        'Purchase order status must be Ordered or Draft',
      );
    }

    const productIds = purchaseOrderItems.map((item) => item.productId);

    await this.validatePurchaseOrderItemsAsync(productIds);

    await this.validateItemsBelongToSupplierAsync(
      productIds,
      purchaseOrderData.supplierId,
    );

    const totalAmount = calculateTotalAmount(purchaseOrderItems);

    const createdPurchaseOrder = await this.unitOfWork.execute(async (tx) => {
      const purchaseOrder =
        await this.purchaseOrderRepository.createPurchaseOrderAsync(
          {
            ...purchaseOrderData,
            totalAmount,
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

      await this.manageStockChanges(
        purchaseOrder,
        purchaseOrderItemsToCreate,
        purchaseOrderData.purchaseOrderStatusId,
        tx,
      );

      return purchaseOrder;
    });

    if (
      purchaseOrderData.purchaseOrderStatusId === PurchaseOrderStatusId.Ordered
    ) {
      const supplier = await this.supplierRepository.findByIdAsync(
        createdPurchaseOrder.supplierId,
      );

      const productNameMap =
        await this.productRepository.getProductsNamesByIdsAsync(productIds);

      const purchaseOrderReportGenerationDataDto: PurchaseOrderReportGenerationDataDto =
        {
          purchaseOrderId: createdPurchaseOrder.id,
          createdAt: createdPurchaseOrder.createdAt,
          estimatedDeliveryDate: createdPurchaseOrder.estimatedDeliveryDate,
          supplierBusinessName: supplier!.businessName,
          supplierDocumentType: supplier!.documentType,
          supplierDocumentNumber: supplier!.documentNumber,
          observation: createdPurchaseOrder.observation ?? '',
          totalAmount: Number(createdPurchaseOrder.totalAmount),
          purchaseOrderItems: purchaseOrderItems.map((item) => ({
            productName: productNameMap.get(item.productId) ?? 'N/A',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotalPrice: item.quantity * Number(item.unitPrice),
          })),
        };

      this.sendPurchaseOrderByEmailAsync(
        purchaseOrderReportGenerationDataDto,
        supplier!.email,
      );
    }
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
      supplier: {
        id: purchaseOrder.supplier.id,
        businessName: purchaseOrder.supplier.businessName,
      },
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

  async downloadWithFiltersAsync(query: DownloadPurchaseOrderQuery) {
    return this.purchaseOrderRepository.downloadWithFiltersAsync(
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

    await this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      const manageStockTask = this.manageStockChanges(
        purchaseOrder,
        purchaseOrder.purchaseOrderItems,
        newStatus,
        tx,
      );

      const updatePurchaseOrderTask =
        this.purchaseOrderRepository.updatePurchaseOrderAsync(
          purchaseOrder.id,
          {
            purchaseOrderStatus: { connect: { id: newStatus } },
            observation: observation ?? purchaseOrder.observation,
            effectiveDeliveryDate:
              effectiveDeliveryDate ?? purchaseOrder.effectiveDeliveryDate,
          },
          tx,
        );

      await Promise.all([manageStockTask, updatePurchaseOrderTask]);
    });

    if (newStatus === PurchaseOrderStatusId.Ordered) {
      const supplier = await this.supplierRepository.findByIdAsync(
        purchaseOrder.supplierId,
      );

      const purchaseOrderItems =
        await this.purchaseOrderItemRepository.findByPurchaseOrderIdAsync(
          purchaseOrder.id,
        );

      const productIds = purchaseOrderItems.map((item) => item.productId);

      const productNameMap =
        await this.productRepository.getProductsNamesByIdsAsync(productIds);

      const purchaseOrderReportGenerationDataDto: PurchaseOrderReportGenerationDataDto =
        {
          purchaseOrderId: purchaseOrder.id,
          createdAt: purchaseOrder.createdAt,
          estimatedDeliveryDate: purchaseOrder.estimatedDeliveryDate,
          supplierBusinessName: supplier!.businessName,
          supplierDocumentType: supplier!.documentType,
          supplierDocumentNumber: supplier!.documentNumber,
          observation: purchaseOrder.observation ?? '',
          totalAmount: Number(purchaseOrder.totalAmount),
          purchaseOrderItems: purchaseOrderItems.map((item) => ({
            productName: productNameMap.get(item.productId) ?? 'N/A',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            subtotalPrice: item.quantity * Number(item.unitPrice),
          })),
        };

      this.sendPurchaseOrderByEmailAsync(
        purchaseOrderReportGenerationDataDto,
        supplier!.email,
      );
    }
  }

  async validatePurchaseOrderExistsAsync(id: number): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findByIdAsync(id);
    if (!purchaseOrder) {
      throw new NotFoundException(
        `Purchase order with id ${id} does not exist.`,
      );
    }
    return purchaseOrder;
  }

  async validatePurchaseOrderItemsAsync(productIds: number[]) {
    if (!productIds || productIds.length === 0) {
      throw new BadRequestException('At least one item must be provided.');
    }

    const productsExist =
      await this.productRepository.existsManyAsync(productIds);

    if (!productsExist) {
      throw new NotFoundException(`One or more products do not exist.`);
    }
  }

  async validateItemsBelongToSupplierAsync(
    productIds: number[],
    supplierId: number,
  ) {
    if (!productIds || productIds.length === 0) {
      throw new BadRequestException('At least one item must be provided.');
    }

    const items =
      await this.productRepository.findManyProductsWithSupplierIdAsync(
        productIds,
      );
    const allBelongToSupplier = items.every(
      (item) => item.supplierId === supplierId,
    );

    if (!allBelongToSupplier) {
      throw new BadRequestException(
        'All items must belong to the same supplier.',
      );
    }
  }

  async updatePurchaseOrderAsync(
    id: number,
    purchaseOrderUpdateDto: PurchaseOrderUpdateDto,
  ) {
    const purchaseOrder = await this.validatePurchaseOrderExistsAsync(id);

    const productIds = purchaseOrderUpdateDto.purchaseOrderItems.map(
      (item) => item.productId,
    );

    await this.validatePurchaseOrderItemsAsync(productIds);

    await this.validateItemsBelongToSupplierAsync(
      productIds,
      purchaseOrder.supplierId,
    );

    const currentPurchaseOrderStatus = purchaseOrder.purchaseOrderStatusId;
    const newPurchaseOrderStatus = purchaseOrderUpdateDto.purchaseOrderStatusId;

    if (
      currentPurchaseOrderStatus === newPurchaseOrderStatus &&
      (newPurchaseOrderStatus === PurchaseOrderStatusId.Cancelled ||
        newPurchaseOrderStatus === PurchaseOrderStatusId.Received ||
        newPurchaseOrderStatus === PurchaseOrderStatusId.Deleted)
    ) {
      throw new BadRequestException(
        `Purchase order ${id} cannot be updated because it is in a final state.`,
      );
    }

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
      await this.purchaseOrderItemRepository.findByPurchaseOrderIdAsync(
        purchaseOrder.id,
      );

    const transformedItems: PurchaseOrderItemDto[] =
      currentPurchaseOrderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      }));

    const arePurchaseOrderItemsEqual = isEqual(
      purchaseOrderItems,
      transformedItems,
    );

    let totalAmount: number = Number(purchaseOrder.totalAmount);
    let purchaseOrderItemsToCreate: PurchaseOrderItemCreationDto[];

    if (!arePurchaseOrderItemsEqual) {
      purchaseOrderItemsToCreate = purchaseOrderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        purchaseOrderId: purchaseOrder.id,
        subtotalPrice: Number(item.unitPrice) * item.quantity,
      }));

      totalAmount = calculateTotalAmount(purchaseOrderItemsToCreate);
    } else {
      purchaseOrderItemsToCreate = currentPurchaseOrderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        purchaseOrderId: purchaseOrder.id,
        subtotalPrice: Number(item.unitPrice) * item.quantity,
      }));
    }

    await this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      if (!arePurchaseOrderItemsEqual) {
        await this.purchaseOrderItemRepository.deleteByPurchaseOrderIdAsync(
          purchaseOrder.id,
          tx,
        );
        await this.purchaseOrderItemRepository.createManyPurchaseOrderItemAsync(
          purchaseOrderItemsToCreate,
          tx,
        );
      }

      const manageStockTask = this.manageStockChanges(
        purchaseOrder,
        purchaseOrderItemsToCreate,
        purchaseOrderUpdateDto.purchaseOrderStatusId,
        tx,
      );

      const updatePurchaseOrderTask =
        this.purchaseOrderRepository.updatePurchaseOrderAsync(
          purchaseOrder.id,
          {
            ...purchaseOrderUpdateData,
            estimatedDeliveryDate:
              purchaseOrderUpdateData.estimatedDeliveryDate.toISOString(),
            totalAmount,
          },
          tx,
        );

      await Promise.all([manageStockTask, updatePurchaseOrderTask]);
    });

    if (newPurchaseOrderStatus === PurchaseOrderStatusId.Ordered) {
      const supplier = await this.supplierRepository.findByIdAsync(
        purchaseOrder.supplierId,
      );

      const productNameMap =
        await this.productRepository.getProductsNamesByIdsAsync(productIds);

      const purchaseOrderReportGenerationDataDto: PurchaseOrderReportGenerationDataDto =
        {
          purchaseOrderId: purchaseOrder.id,
          createdAt: purchaseOrder.createdAt,
          estimatedDeliveryDate: purchaseOrder.estimatedDeliveryDate,
          supplierBusinessName: supplier!.businessName,
          supplierDocumentType: supplier!.documentType,
          supplierDocumentNumber: supplier!.documentNumber,
          observation: purchaseOrder.observation ?? '',
          totalAmount: Number(purchaseOrder.totalAmount),
          purchaseOrderItems: purchaseOrderItems.map((item) => ({
            productName: productNameMap.get(item.productId) ?? 'N/A',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotalPrice: item.quantity * Number(item.unitPrice),
          })),
        };

      this.sendPurchaseOrderByEmailAsync(
        purchaseOrderReportGenerationDataDto,
        supplier!.email,
      );
    }
  }

  private async manageStockChanges(
    purchaseOrder: PurchaseOrder,
    purchaseOrderItems: { productId: number; quantity: number }[],
    newStatus: PurchaseOrderStatusId,
    tx: Prisma.TransactionClient,
  ) {
    const stockUpdates: StockChangeCreationDataDto[] = [];

    switch (newStatus) {
      case PurchaseOrderStatusId.Draft:
        break;

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

  async sendPurchaseOrderByEmailAsync(
    purchaseOrder: PurchaseOrderReportGenerationDataDto,
    supplierEmail: string,
  ) {
    const pdfDoc =
      await this.reportService.generatePurchaseOrderReport(purchaseOrder);
    const buffer = await pdfToBuffer(pdfDoc);

    const htmlBody = purchaseOrderHtmlReport(purchaseOrder);

    return this.mailingService.sendMailWithAttachmentAsync(
      supplierEmail,
      `Orden de compra #${purchaseOrder.purchaseOrderId}`,
      htmlBody,
      {
        filename: `MP-OC-${purchaseOrder.purchaseOrderId}.pdf`,
        content: buffer,
      },
    );
  }
}
