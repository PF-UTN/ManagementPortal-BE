import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';

import {
  StockChangedField,
  StockChangeTypeIds,
  OrderStatusId,
  PaymentTypeEnum,
  canOrderTransition,
  DeliveryMethodId,
  deliveryMethodTranslations,
  PaymentTypeTranslations,
} from '@mp/common/constants';
import {
  StockChangeCreationDataDto,
  StockDto,
  OrderCreationDto,
  SearchOrderFromClientServiceDto,
  OrderDetailsDto,
  OrderDetailsToClientDto,
  BillReportGenerationDataDto,
} from '@mp/common/dtos';
import { OrderItemDataDto, OrderItemDataToClientDto } from '@mp/common/dtos';
import { calculateTotalAmount, pdfToBuffer } from '@mp/common/helpers';
import { MailingService, ReportService } from '@mp/common/services';
import { BillRepository } from '@mp/repository';
import {
  BillItemRepository,
  PrismaUnitOfWork,
  ProductRepository,
  StockChangeRepository,
} from '@mp/repository';
import {
  PaymentDetailRepository,
  OrderItemRepository,
  OrderRepository,
} from '@mp/repository';

import { ClientService } from '../client/client.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly unitOfWork: PrismaUnitOfWork,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly paymentDetailRepository: PaymentDetailRepository,
    private readonly stockService: StockService,
    private readonly stockChangeRepository: StockChangeRepository,
    private readonly clientService: ClientService,
    private readonly reportService: ReportService,
    private readonly mailingService: MailingService,
    private readonly billRepository: BillRepository,
    private readonly billItemRepository: BillItemRepository,
  ) {}

  async createOrderAsync(orderCreationDto: OrderCreationDto) {
    const { paymentDetail, orderItems, ...orderData } = orderCreationDto;

    const client = await this.clientService.findClientByIdAsync(
      orderData.clientId,
    );
    if (!client) {
      throw new NotFoundException(
        `Client with ID ${orderData.clientId} does not exist.`,
      );
    }

    const paymentType = PaymentTypeEnum[paymentDetail.paymentTypeId];
    if (!paymentType) {
      throw new NotFoundException(
        `PaymentType with ID ${paymentDetail.paymentTypeId} does not exist.`,
      );
    }

    if (
      paymentDetail.paymentTypeId === PaymentTypeEnum.UponDelivery &&
      orderData.deliveryMethodId === DeliveryMethodId.HomeDelivery &&
      orderData.orderStatusId !== OrderStatusId.Pending
    ) {
      throw new BadRequestException(
        'Invalid order status. Only PENDING orders can be created with Upon Delivery payment method and home delivery delivery method.',
      );
    }

    if (
      paymentDetail.paymentTypeId === PaymentTypeEnum.CreditDebitCard &&
      orderData.orderStatusId !== OrderStatusId.PaymentPending
    ) {
      throw new BadRequestException(
        'Invalid order status. Only PAYMENT_PENDING orders can be created with Credit/Debit Card payment method.',
      );
    }

    if (
      paymentDetail.paymentTypeId === PaymentTypeEnum.UponDelivery &&
      orderData.deliveryMethodId === DeliveryMethodId.PickUpAtStore &&
      orderData.orderStatusId !== OrderStatusId.InPreparation
    ) {
      throw new BadRequestException(
        'Invalid order status. Only IN_PREPARATION orders can be created with Pick Up At Store delivery method and Upon Delivery payment method.',
      );
    }

    const productIds = orderItems.map((item) => item.productId);

    await this.validateOrderItemsAsync(productIds);
    await this.validateStockForOrderItemsAsync(orderItems);

    const totalAmount = calculateTotalAmount(orderItems);

    await this.unitOfWork.execute(async (tx) => {
      const paymentDetailCreated =
        await this.paymentDetailRepository.createPaymentDetailAsync(
          paymentDetail,
          tx,
        );
      const order = await this.orderRepository.createOrderAsync(
        { ...orderData, totalAmount, paymentDetailId: paymentDetailCreated.id },
        tx,
      );

      const orderItemsToCreate = orderItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotalPrice: item.quantity * Number(item.unitPrice),
      }));

      await this.orderItemRepository.createManyOrderItemAsync(
        orderItemsToCreate,
        tx,
      );

      await this.manageStockChanges(
        order,
        orderItemsToCreate,
        null,
        orderData.orderStatusId,
        tx,
      );
      return order;
    });
  }

  async updateOrderStatusAsync(id: number, newStatus: OrderStatusId) {
    const order = await this.orderRepository.findOrderByIdAsync(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} does not exist.`);
    }
    const currentStatus = order.orderStatusId;

    const validTransition = canOrderTransition(currentStatus, newStatus);
    if (!validTransition) {
      throw new BadRequestException(
        `Invalid status transition from ${OrderStatusId[currentStatus]} to ${OrderStatusId[newStatus]}`,
      );
    }
    const orderItems = await this.orderItemRepository.findByOrderIdAsync(
      order.id,
    );

    await this.orderRepository.updateOrderAsync(order.id, {
      orderStatus: { connect: { id: newStatus } },
    });

    if (newStatus === OrderStatusId.Finished) {
      const createBill = await this.unitOfWork.execute(
        async (tx: Prisma.TransactionClient) => {
          const bill = await this.billRepository.createBillAsync(
            {
              beforeTaxPrice: order.totalAmount,
              totalPrice: order.totalAmount,
              orderId: order.id,
            },
            tx,
          );

          const billItemsToCreate = orderItems.map((item) => ({
            subTotalPrice: item.subtotalPrice,
            billId: bill.id,
          }));

          await this.billItemRepository.createManyBillItemAsync(
            billItemsToCreate,
            tx,
          );

          return bill;
        },
      );
      const billReportGenerationDataDto: BillReportGenerationDataDto = {
        billId: createBill.id,
        orderId: order.id,
        clientCompanyName: order.client.companyName,
        clientAddress: `${order.client.address.street} ${order.client.address.streetNumber}`,
        clientDocumentType: order.client.user.documentType,
        clientDocumentNumber: order.client.user.documentNumber,
        clientTaxCategory: order.client.taxCategory.name,
        deliveryMethod:
          deliveryMethodTranslations[order.deliveryMethod.name] ||
          order.deliveryMethod.name,
        totalAmount: order.totalAmount,
        orderItems: orderItems.map((item) => ({
          productName: item.product.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotalPrice: item.subtotalPrice,
        })),
        paymentType:
          PaymentTypeTranslations[order.paymentDetail.paymentType.name] ||
          order.paymentDetail.paymentType.name,
        observation: '',
        createdAt: new Date(),
      };
      this.sendBillByEmailAsync(
        billReportGenerationDataDto,
        order.client.user.email,
      );
    }
  }

  async validateOrderItemsAsync(productIds: number[]) {
    if (!productIds || productIds.length === 0) {
      throw new BadRequestException('At least one item must be provided.');
    }

    const productsExist =
      await this.productRepository.existsManyAsync(productIds);

    if (!productsExist) {
      throw new NotFoundException(`One or more products do not exist.`);
    }
  }

  async validateStockForOrderItemsAsync(
    orderItems: { productId: number; quantity: number }[],
  ) {
    for (const item of orderItems) {
      const stock = await this.stockService.findByProductIdAsync(
        item.productId,
      );

      if (!stock) {
        throw new NotFoundException(
          `Stock not found for product ID ${item.productId}`,
        );
      }

      if (stock.quantityAvailable < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for product ID ${item.productId}. Requested: ${item.quantity}, Available: ${stock.quantityAvailable}`,
        );
      }
    }
  }

  private async manageStockChanges(
    order: Order,
    orderItems: { productId: number; quantity: number }[],
    oldStatus: OrderStatusId | null,
    newStatus: OrderStatusId,
    tx: Prisma.TransactionClient,
  ) {
    const stockUpdates: StockChangeCreationDataDto[] = [];
    switch (newStatus) {
      case OrderStatusId.Pending: {
        const stocks = await Promise.all(
          orderItems.map((item) =>
            this.stockService.findByProductIdAsync(item.productId, tx),
          ),
        );
        const updatePromises = orderItems.map((item, index) => {
          const stock = stocks[index];
          if (!stock) {
            throw new NotFoundException(
              `Stock not found for product ID ${item.productId}`,
            );
          }

          const newStock: StockDto = {
            quantityAvailable: stock.quantityAvailable - item.quantity,
            quantityOrdered: stock.quantityOrdered,
            quantityReserved: stock.quantityReserved + item.quantity,
          };
          stockUpdates.push({
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Outcome,
            changedField: StockChangedField.QuantityAvailable,
            previousValue: stock.quantityAvailable,
            newValue: newStock.quantityAvailable,
            reason: `Order ${order.id} pending.`,
          });
          stockUpdates.push({
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Income,
            changedField: StockChangedField.QuantityReserved,
            previousValue: stock.quantityReserved,
            newValue: newStock.quantityReserved,
            reason: `Order ${order.id} pending.`,
          });
          return this.stockService.updateStockByProductIdAsync(
            item.productId,
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

      case OrderStatusId.InPreparation: {
        if (
          (oldStatus === OrderStatusId.PaymentPending &&
            order.paymentDetailId === PaymentTypeEnum.CreditDebitCard) ||
          (oldStatus === null &&
            order.paymentDetailId === PaymentTypeEnum.UponDelivery)
        ) {
          const stocks = await Promise.all(
            orderItems.map((item) =>
              this.stockService.findByProductIdAsync(item.productId, tx),
            ),
          );
          const updatePromises = orderItems.map((item, index) => {
            const stock = stocks[index];
            if (!stock) {
              throw new NotFoundException(
                `Stock not found for product ID ${item.productId}`,
              );
            }

            const newStock: StockDto = {
              quantityAvailable: stock.quantityAvailable - item.quantity,
              quantityOrdered: stock.quantityOrdered,
              quantityReserved: stock.quantityReserved + item.quantity,
            };
            stockUpdates.push({
              productId: item.productId,
              changeTypeId: StockChangeTypeIds.Outcome,
              changedField: StockChangedField.QuantityAvailable,
              previousValue: stock.quantityAvailable,
              newValue: newStock.quantityAvailable,
              reason: `Order ${order.id} in preparation to pick up.`,
            });
            stockUpdates.push({
              productId: item.productId,
              changeTypeId: StockChangeTypeIds.Income,
              changedField: StockChangedField.QuantityReserved,
              previousValue: stock.quantityReserved,
              newValue: newStock.quantityReserved,
              reason: `Order ${order.id} in preparation to pick up.`,
            });
            return this.stockService.updateStockByProductIdAsync(
              item.productId,
              newStock,
              tx,
            );
          });
          await Promise.all(updatePromises);
          await this.stockChangeRepository.createManyStockChangeAsync(
            stockUpdates,
            tx,
          );
        }
        break;
      }
      case OrderStatusId.Shipped:
        break;
      case OrderStatusId.Cancelled: {
        const stocks = await Promise.all(
          orderItems.map((item) =>
            this.stockService.findByProductIdAsync(item.productId, tx),
          ),
        );
        const updatePromises = orderItems.map((item, index) => {
          const stock = stocks[index];
          if (!stock) {
            throw new NotFoundException(
              `Stock not found for product ID ${item.productId}`,
            );
          }

          const newStock: StockDto = {
            quantityAvailable: stock.quantityAvailable + item.quantity,
            quantityOrdered: stock.quantityOrdered,
            quantityReserved: stock.quantityReserved - item.quantity,
          };
          stockUpdates.push({
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Income,
            changedField: StockChangedField.QuantityAvailable,
            previousValue: stock.quantityAvailable,
            newValue: newStock.quantityAvailable,
            reason: `Order ${order.id} cancelled.`,
          });
          stockUpdates.push({
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Outcome,
            changedField: StockChangedField.QuantityReserved,
            previousValue: stock.quantityReserved,
            newValue: newStock.quantityReserved,
            reason: `Order ${order.id} cancelled.`,
          });
          return this.stockService.updateStockByProductIdAsync(
            item.productId,
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
      case OrderStatusId.Finished: {
        const stocks = await Promise.all(
          orderItems.map((item) =>
            this.stockService.findByProductIdAsync(item.productId, tx),
          ),
        );
        const updatePromises = orderItems.map((item, index) => {
          const stock = stocks[index];
          if (!stock) {
            throw new NotFoundException(
              `Stock not found for product ID ${item.productId}`,
            );
          }

          const newStock: StockDto = {
            quantityAvailable: stock.quantityAvailable,
            quantityOrdered: stock.quantityOrdered,
            quantityReserved: stock.quantityReserved - item.quantity,
          };
          stockUpdates.push({
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Outcome,
            changedField: StockChangedField.QuantityReserved,
            previousValue: stock.quantityReserved,
            newValue: newStock.quantityReserved,
            reason: `Order ${order.id} picked up.`,
          });
          return this.stockService.updateStockByProductIdAsync(
            item.productId,
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
    }
  }

  async searchClientOrdersWithFiltersAsync(
    query: SearchOrderFromClientServiceDto,
  ) {
    return this.orderRepository.searchClientOrdersWithFiltersAsync(
      query.clientId,
      query.page,
      query.pageSize,
      query.searchText,
      query.filters,
      query.orderBy,
    );
  }

  async findOrderByIdAsync(id: number) {
    const order = await this.orderRepository.findOrderByIdAsync(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} does not exist.`);
    }

    const items = await this.orderItemRepository.findByOrderIdAsync(order.id);

    const itemsDto: OrderItemDataDto[] = items.map((item) => ({
      id: item.id,
      product: {
        name: item.product.name,
        description: item.product.description,
        price: Number(item.product.price),
        enabled: item.product.enabled,
        weight: Number(item.product.weight),
        category: {
          name: item.product.category.name,
        },
        stock: {
          quantityAvailable: item.product.stock?.quantityAvailable ?? 0,
          quantityOrdered: item.product.stock?.quantityOrdered ?? 0,
          quantityReserved: item.product.stock?.quantityReserved ?? 0,
        },
        supplier: {
          businessName: item.product.supplier.businessName,
          email: item.product.supplier.email,
          phone: item.product.supplier.phone,
        },
      },
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotalPrice: Number(item.subtotalPrice),
      orderId: item.orderId,
    }));

    const orderDto: OrderDetailsDto = {
      id: order.id,
      client: {
        companyName: order.client.companyName,
        user: {
          firstName: order.client.user.firstName,
          lastName: order.client.user.lastName,
          email: order.client.user.email,
          phone: order.client.user.phone,
        },
        address: {
          street: order.client.address.street,
          streetNumber: order.client.address.streetNumber,
        },
        taxCategory: {
          name: order.client.taxCategory.name,
          description: order.client.taxCategory.description ?? '',
        },
      },
      deliveryMethodName: order.deliveryMethod.name,
      orderStatus: {
        name: order.orderStatus.name,
      },
      paymentDetail: {
        paymentType: {
          name: order.paymentDetail.paymentType.name,
        },
      },
      orderItems: itemsDto,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
    };
    return orderDto;
  }

  async findOrderByIdForClientAsync(id: number, clientId: number) {
    const order = await this.orderRepository.findOrderByIdAsync(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} does not exist.`);
    }

    if (order.clientId !== clientId) {
      throw new NotFoundException(
        `Order with ID ${id} does not exist for this client.`,
      );
    }

    const items = await this.orderItemRepository.findByOrderIdAsync(order.id);

    const itemsDto: OrderItemDataToClientDto[] = items.map((item) => ({
      product: {
        name: item.product.name,
        description: item.product.description,
        price: Number(item.product.price),
        weight: Number(item.product.weight),
        category: {
          name: item.product.category.name,
        },
      },
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotalPrice: Number(item.subtotalPrice),
    }));

    const orderDto: OrderDetailsToClientDto = {
      id: order.id,
      client: {
        companyName: order.client.companyName,
        user: {
          firstName: order.client.user.firstName,
          lastName: order.client.user.lastName,
          email: order.client.user.email,
          phone: order.client.user.phone,
        },
        address: {
          street: order.client.address.street,
          streetNumber: order.client.address.streetNumber,
        },
        taxCategory: {
          name: order.client.taxCategory.name,
          description: order.client.taxCategory.description ?? '',
        },
      },
      deliveryMethodName: order.deliveryMethod.name,
      orderStatus: {
        name: order.orderStatus.name,
      },
      paymentDetail: {
        paymentType: {
          name: order.paymentDetail.paymentType.name,
        },
      },
      orderItems: itemsDto,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
    };
    return orderDto;
  }

  async sendBillByEmailAsync(
    bill: BillReportGenerationDataDto,
    clientEmail: string,
  ) {
    const pdfDoc = await this.reportService.generateBillReport(bill);

    const buffer = await pdfToBuffer(pdfDoc);

    return this.mailingService.sendMailWithAttachmentAsync(
      clientEmail,
      `Factura #${bill.billId}`,
      'Adjuntamos la factura en formato PDF.',
      {
        filename: `MP-FC-${bill.billId}.pdf`,
        content: buffer,
      },
    );
  }
}
