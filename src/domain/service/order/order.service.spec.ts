import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { mockDeep } from 'jest-mock-extended';
import { PassThrough } from 'stream';

import {
  OrderDirection,
  OrderField,
  DeliveryMethodId,
  OrderStatusId,
  PaymentTypeEnum,
  StockChangeTypeIds,
  StockChangedField,
} from '@mp/common/constants';
import { SearchOrderFiltersDto } from '@mp/common/dtos';
import { MailingService, ReportService } from '@mp/common/services';
import {
  clientMock,
  mockOrderItem,
  mockPaymentDetail,
  orderCreationDtoMock,
  orderMock,
  stockMock,
  txMock,
} from '@mp/common/testing';
import {
  BillItemRepository,
  BillRepository,
  OrderItemRepository,
  OrderRepository,
  PaymentDetailRepository,
  PrismaUnitOfWork,
  ProductRepository,
  StockChangeRepository,
} from '@mp/repository';

import { OrderService } from './order.service';
import { DownloadOrderQuery } from '../../../controllers/order/query/download-order.query';
import { SearchOrderQuery } from '../../../controllers/order/query/search-order.query';
import { ClientService } from '../client/client.service';
import { StockService } from '../stock/stock.service';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: OrderRepository;
  let productRepository: ProductRepository;
  let orderItemRepository: OrderItemRepository;
  let paymentDetailRepository: PaymentDetailRepository;
  let stockService: StockService;
  let stockChangeRepository: StockChangeRepository;
  let unitOfWork: PrismaUnitOfWork;
  let clientService: ClientService;
  let reportService: ReportService;
  let mailingService: MailingService;
  let billRepository: BillRepository;
  let billItemRepository: BillItemRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockDeep(OrderRepository) },
        { provide: ProductRepository, useValue: mockDeep(ProductRepository) },
        {
          provide: OrderItemRepository,
          useValue: mockDeep(OrderItemRepository),
        },
        {
          provide: PaymentDetailRepository,
          useValue: mockDeep(PaymentDetailRepository),
        },
        { provide: StockService, useValue: mockDeep(StockService) },
        {
          provide: StockChangeRepository,
          useValue: mockDeep(StockChangeRepository),
        },
        { provide: PrismaUnitOfWork, useValue: mockDeep(PrismaUnitOfWork) },
        { provide: ClientService, useValue: mockDeep(ClientService) },
        { provide: ReportService, useValue: mockDeep(ReportService) },
        { provide: MailingService, useValue: mockDeep(MailingService) },
        { provide: BillRepository, useValue: mockDeep(BillRepository) },
        { provide: BillItemRepository, useValue: mockDeep(BillItemRepository) },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);
    orderItemRepository = module.get<OrderItemRepository>(OrderItemRepository);
    paymentDetailRepository = module.get<PaymentDetailRepository>(
      PaymentDetailRepository,
    );
    stockService = module.get<StockService>(StockService);
    stockChangeRepository = module.get<StockChangeRepository>(
      StockChangeRepository,
    );
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);
    clientService = module.get<ClientService>(ClientService);
    reportService = module.get<ReportService>(ReportService);
    mailingService = module.get<MailingService>(MailingService);
    billRepository = module.get<BillRepository>(BillRepository);
    billItemRepository = module.get<BillItemRepository>(BillItemRepository);
  });

  describe('createOrderAsync', () => {
    it('should throw NotFoundException if client does not exist', async () => {
      // Arrange
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(null);
      // Act & Assert
      await expect(
        service.createOrderAsync(orderCreationDtoMock),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw NotFoundException if payment type does not exist', async () => {
      // Arrange
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);

      // Act & Assert
      await expect(
        service.createOrderAsync({
          ...orderCreationDtoMock,
          paymentDetail: { ...mockPaymentDetail, paymentTypeId: 999 },
        }),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException if UponDelivery + HomeDelivery + status !== Pending', async () => {
      const dto = {
        ...orderCreationDtoMock,
        paymentDetail: {
          ...mockPaymentDetail,
          paymentTypeId: PaymentTypeEnum.UponDelivery,
        },
        deliveryMethodId: DeliveryMethodId.HomeDelivery,
        orderStatusId: OrderStatusId.Shipped,
      };

      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);

      await expect(service.createOrderAsync(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw BadRequestException if CreditDebitCard + status !== PaymentPending', async () => {
      const dto = {
        ...orderCreationDtoMock,
        paymentDetail: {
          ...mockPaymentDetail,
          paymentTypeId: PaymentTypeEnum.CreditDebitCard,
        },
        orderStatusId: OrderStatusId.Pending, // Distinto de PaymentPending
      };

      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);

      await expect(service.createOrderAsync(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if UponDelivery + PickUpAtStore + status !== InPreparation', async () => {
      const dto = {
        ...orderCreationDtoMock,
        paymentDetail: {
          ...mockPaymentDetail,
          paymentTypeId: PaymentTypeEnum.UponDelivery,
        },
        deliveryMethodId: DeliveryMethodId.PickUpAtStore,
        orderStatusId: OrderStatusId.Pending, // Distinto de InPreparation
      };

      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);

      await expect(service.createOrderAsync(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no products are provided', async () => {
      // Arrange
      const dto = {
        ...orderCreationDtoMock,
        orderStatusId: OrderStatusId.PaymentPending,
        orderItems: [],
      };
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);

      // Act & Assert
      await expect(service.createOrderAsync(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if products do not exist', async () => {
      // Arrange
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);
      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createOrderAsync({
          ...orderCreationDtoMock,
          orderStatusId: OrderStatusId.PaymentPending,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if stock is missing', async () => {
      // Arrange
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);
      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.createOrderAsync({
          ...orderCreationDtoMock,
          orderStatusId: OrderStatusId.PaymentPending,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      // Arrange
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);
      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValueOnce(stockMock);

      // Act & Assert
      await expect(
        service.createOrderAsync({
          ...orderCreationDtoMock,
          orderStatusId: OrderStatusId.PaymentPending,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call unitOfWork.execute with the correct transaction client', async () => {
      // Arrange
      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(true);

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);

      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue({ ...stockMock, quantityAvailable: 20 });
      jest
        .spyOn(paymentDetailRepository, 'createPaymentDetailAsync')
        .mockResolvedValue({
          id: 1,
          paymentTypeId: orderCreationDtoMock.paymentDetail.paymentTypeId,
        });
      jest.spyOn(orderRepository, 'createOrderAsync').mockResolvedValueOnce({
        ...orderMock,
        orderStatusId: OrderStatusId.PaymentPending,
        paymentDetailId: 1,
      });

      // Act
      await service.createOrderAsync({
        ...orderCreationDtoMock,
        orderStatusId: OrderStatusId.PaymentPending,
      });

      // Assert
      expect(unitOfWork.execute).toHaveBeenCalled();
    });
    it('should create an order successfully when all inputs are valid', async () => {
      // Arrange
      jest.spyOn(productRepository, 'existsManyAsync').mockResolvedValue(true);
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue({ ...stockMock, quantityAvailable: 20 });

      const txMock = {} as Prisma.TransactionClient;
      jest
        .spyOn(unitOfWork, 'execute')
        .mockImplementation(async (cb) => cb(txMock));

      const paymentDetailMock = {
        id: 1,
        paymentTypeId: orderCreationDtoMock.paymentDetail.paymentTypeId,
      };
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);
      jest
        .spyOn(orderRepository, 'createOrderAsync')
        .mockResolvedValue(orderMock);
      jest
        .spyOn(paymentDetailRepository, 'createPaymentDetailAsync')
        .mockResolvedValue(paymentDetailMock);
      jest
        .spyOn(stockChangeRepository, 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      // Act
      await service.createOrderAsync({
        ...orderCreationDtoMock,
        orderStatusId: OrderStatusId.PaymentPending,
      });

      // Assert
      expect(unitOfWork.execute).toHaveBeenCalled();
      expect(orderRepository.createOrderAsync).toHaveBeenCalled();
    });
    it('should call orderItemRepository.createManyOrderItemAsync with the correct data', async () => {
      // Arrange
      jest.spyOn(productRepository, 'existsManyAsync').mockResolvedValue(true);
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue({ ...stockMock, quantityAvailable: 20 });

      jest
        .spyOn(unitOfWork, 'execute')
        .mockImplementation(async (cb) => cb(txMock));
      jest
        .spyOn(orderRepository, 'createOrderAsync')
        .mockResolvedValue(orderMock);
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);
      jest
        .spyOn(paymentDetailRepository, 'createPaymentDetailAsync')
        .mockResolvedValue(mockPaymentDetail);
      jest
        .spyOn(stockChangeRepository, 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      const createManySpy = jest.spyOn(
        orderItemRepository,
        'createManyOrderItemAsync',
      );

      // Act
      await service.createOrderAsync({
        ...orderCreationDtoMock,
        orderStatusId: OrderStatusId.PaymentPending,
      });

      // Assert
      expect(createManySpy).toHaveBeenCalledWith(mockOrderItem, txMock);
    });
  });
  describe('updateOrderStatusAsync', () => {
    const orderItemsMock = [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        unitPrice: new Prisma.Decimal(10.0),
        quantity: 5,
        subtotalPrice: new Prisma.Decimal(50.0),
        product: {
          id: 1,
          name: 'Test Product',
          description: 'Producto de prueba',
          price: new Prisma.Decimal(10.0),
          enabled: true,
          weight: new Prisma.Decimal(1.5),
          imageUrl: 'https://test.com/image.jpg',
          categoryId: 1,
          supplierId: 1,
          deletedAt: null,
          category: {
            id: 1,
            name: 'Test Category',
            description: 'Categoría de prueba',
          },
          supplier: {
            id: 1,
            addressId: 1,
            email: 'proveedor@test.com',
            phone: '123456789',
            documentType: 'CUIT',
            documentNumber: '20123456789',
            businessName: 'Proveedor S.A.',
          },
          stock: {
            id: 1,
            productId: 1,
            quantityOrdered: 10,
            quantityAvailable: 100,
            quantityReserved: 5,
          },
        },
      },
    ];

    const orderMock = {
      id: 1,
      clientId: 1,
      orderStatusId: OrderStatusId.InPreparation,
      paymentDetailId: 1,
      deliveryMethodId: 1,
      shipmentId: 1,
      client: {
        id: 1,
        companyName: 'Test Company',
        user: {
          id: 1,
          firstName: 'Juan',
          lastName: 'Perez',
          email: 'juan@mail.com',
          password: 'test-password',
          phone: '123456789',
          documentType: 'DNI',
          documentNumber: '12345678',
          birthdate: new Date('1990-01-01'),
          roleId: 2,
          accountLockedUntil: null,
          failedLoginAttempts: 0,
        },
        address: {
          id: 1,
          street: 'Calle Falsa',
          streetNumber: 123,
          townId: 1,
        },
        taxCategory: {
          id: 1,
          name: 'Responsable Inscripto',
          description: '',
        },
        userId: 1,
        taxCategoryId: 1,
        addressId: 1,
      },
      deliveryMethod: {
        id: 1,
        name: 'Delivery',
        description: 'Envío a domicilio',
      },
      orderStatus: {
        id: 1,
        name: 'Pending',
      },
      paymentDetail: {
        paymentType: {
          id: 1,
          name: 'Efectivo',
          description: null,
        },
        id: 1,
        paymentTypeId: 1,
      },
      orderItems: orderItemsMock,
      totalAmount: new Prisma.Decimal(105),
      createdAt: new Date(),
    };

    it('should throw NotFoundException if order does not exist', async () => {
      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce(null);

      await expect(
        service.updateOrderStatusAsync(999, OrderStatusId.Prepared),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if transition is invalid', async () => {
      jest.spyOn(orderRepository, 'findOrderByIdAsync').mockResolvedValueOnce({
        ...orderMock,
        orderStatusId: OrderStatusId.Pending,
      });

      await expect(
        service.updateOrderStatusAsync(orderMock.id, OrderStatusId.Finished),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update order status and create bill when status is Finished', async () => {
      // Arrange
      const bill = {
        id: 1,
        beforeTaxPrice: new Decimal(100),
        totalPrice: new Decimal(121),
        orderId: orderMock.id,
      };

      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce({
          ...orderMock,
          orderStatusId: OrderStatusId.Shipped,
        })
        .mockResolvedValueOnce({
          ...orderMock,
          orderStatusId: OrderStatusId.Finished,
        });
      jest
        .spyOn(orderItemRepository, 'findByOrderIdAsync')
        .mockResolvedValueOnce(orderItemsMock)
        .mockResolvedValueOnce(orderItemsMock);
      jest.spyOn(orderRepository, 'updateOrderAsync').mockResolvedValueOnce({
        ...orderMock,
        orderStatusId: OrderStatusId.Finished,
      });

      jest
        .spyOn(unitOfWork, 'execute')
        .mockImplementation(async (cb) => cb(txMock));
      jest.spyOn(billRepository, 'createBillAsync').mockResolvedValueOnce(bill);
      jest.spyOn(billItemRepository, 'createManyBillItemAsync');
      jest
        .spyOn(service, 'sendBillByEmailAsync')
        .mockResolvedValueOnce(undefined);

      // Act
      await service.updateOrderStatusAsync(
        orderMock.id,
        OrderStatusId.Finished,
      );

      // Assert
      expect(orderRepository.updateOrderAsync).toHaveBeenCalledWith(
        orderMock.id,
        { orderStatusId: OrderStatusId.Finished },
      );
      expect(billRepository.createBillAsync).toHaveBeenCalledWith(
        {
          beforeTaxPrice: orderMock.totalAmount,
          totalPrice: orderMock.totalAmount,
          orderId: orderMock.id,
        },
        txMock,
      );
      expect(billItemRepository.createManyBillItemAsync).toHaveBeenCalled();
      expect(service.sendBillByEmailAsync).toHaveBeenCalled();
    });
  });
  describe('validateOrderItemsAsync', () => {
    it('should throw BadRequestException if there are not products', async () => {
      // Arrange
      const productIds: number[] = [];

      // Act & Assert
      await expect(service.validateOrderItemsAsync(productIds)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if one or more products do not exist', async () => {
      // Arrange
      const productIds: number[] = [999];
      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(service.validateOrderItemsAsync(productIds)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateStockForOrderItemsAsync', () => {
    const orderItemsMock = [{ productId: 1, quantity: 5 }];

    it('should throw NotFoundException if stock is missing', async () => {
      // Arrange
      jest.spyOn(stockService, 'findByProductIdAsync').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateStockForOrderItemsAsync(orderItemsMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      // Arrange
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue({ ...stockMock, quantityAvailable: 3 });

      // Act & Assert
      await expect(
        service.validateStockForOrderItemsAsync(orderItemsMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not throw if stock is sufficient', async () => {
      // Arrange
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue({ ...stockMock, quantityAvailable: 10 });

      // Act & Assert
      await expect(
        service.validateStockForOrderItemsAsync(orderItemsMock),
      ).resolves.not.toThrow();
    });
  });

  describe('manageStockChanges', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should update stocks and register changes for valid items', async () => {
      // Arrange
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue(stockMock);
      jest
        .spyOn(stockService, 'updateStockByProductIdAsync')
        .mockResolvedValue(undefined);
      jest
        .spyOn(stockChangeRepository, 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      const orderItems = [{ productId: 1, quantity: 5 }];
      const tx = txMock;

      // Act
      await service['updateStocksAndRegisterChanges'](
        orderItems,
        tx,
        (stock, item) => ({
          quantityAvailable: stock.quantityAvailable - item.quantity,
          quantityOrdered: stock.quantityOrdered,
          quantityReserved: stock.quantityReserved + item.quantity,
        }),
        (stock, newStock, item) => [
          {
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Outcome,
            changedField: StockChangedField.QuantityAvailable,
            previousValue: stock.quantityAvailable,
            newValue: newStock.quantityAvailable,
            reason: 'Test reason',
          },
          {
            productId: item.productId,
            changeTypeId: StockChangeTypeIds.Income,
            changedField: StockChangedField.QuantityReserved,
            previousValue: stock.quantityReserved,
            newValue: newStock.quantityReserved,
            reason: 'Test reason',
          },
        ],
      );

      // Assert
      expect(stockService.updateStockByProductIdAsync).toHaveBeenCalled();
      expect(
        stockChangeRepository.createManyStockChangeAsync,
      ).toHaveBeenCalled();
    });
    it('should throw NotFoundException if stock is missing for a product in Pending', async () => {
      // Arrange
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValueOnce(null);
      // Act & Assert
      await expect(
        service['manageStockChanges'](
          orderMock,
          [{ ...mockOrderItem, productId: 1, quantity: 5 }],
          null,
          null,
          OrderStatusId.Pending,
          txMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });
    it('should not update stock or create stock changes when status is Shipped', async () => {
      // Arrange
      const updateSpy = jest.spyOn(stockService, 'updateStockByProductIdAsync');
      const changeSpy = jest.spyOn(
        stockChangeRepository,
        'createManyStockChangeAsync',
      );
      // Act
      await service['manageStockChanges'](
        orderMock,
        [{ ...mockOrderItem, productId: 1, quantity: 5 }],
        null,
        null,
        OrderStatusId.Shipped,
        txMock,
      );
      // Assert
      expect(updateSpy).not.toHaveBeenCalled();
      expect(changeSpy).not.toHaveBeenCalled();
    });
    it('should call updateStockByProductIdAsync and createManyStockChangeAsync when status is Pending', async () => {
      // Arrange
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue(stockMock);
      jest
        .spyOn(stockService, 'updateStockByProductIdAsync')
        .mockResolvedValue(undefined);
      jest
        .spyOn(stockChangeRepository, 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      // Act
      await service['manageStockChanges'](
        orderMock,
        [{ ...mockOrderItem, productId: 1, quantity: 5 }],
        null,
        null,
        OrderStatusId.Pending,
        txMock,
      );

      // Assert
      expect(stockService.updateStockByProductIdAsync).toHaveBeenCalledWith(
        1,
        { quantityAvailable: 0, quantityOrdered: 0, quantityReserved: 5 },
        txMock,
      );
      expect(
        stockChangeRepository.createManyStockChangeAsync,
      ).toHaveBeenCalled();
    });

    it('should call updateStockByProductIdAsync and createManyStockChangeAsync when status is Cancelled', async () => {
      // Arrange
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue({ ...stockMock, quantityReserved: 10 });
      jest
        .spyOn(stockService, 'updateStockByProductIdAsync')
        .mockResolvedValue(undefined);
      jest
        .spyOn(stockChangeRepository, 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      // Act
      await service['manageStockChanges'](
        orderMock,
        [{ ...mockOrderItem, productId: 1, quantity: 10 }],
        null,
        null, // oldStatus
        OrderStatusId.Cancelled,
        txMock,
      );

      // Assert
      expect(stockService.updateStockByProductIdAsync).toHaveBeenCalledWith(
        1,
        { quantityAvailable: 15, quantityOrdered: 0, quantityReserved: 0 },
        txMock,
      );
      expect(
        stockChangeRepository.createManyStockChangeAsync,
      ).toHaveBeenCalled();
    });

    it('should call updateStockByProductIdAsync and createManyStockChangeAsync when status is finished', async () => {
      // Arrange
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValue({ ...stockMock, quantityReserved: 5 });
      jest
        .spyOn(stockService, 'updateStockByProductIdAsync')
        .mockResolvedValue(undefined);
      jest
        .spyOn(stockChangeRepository, 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      // Act
      await service['manageStockChanges'](
        orderMock,
        [{ ...mockOrderItem, productId: 1, quantity: 5 }],
        null,
        null,
        OrderStatusId.Finished,
        txMock,
      );

      // Assert
      expect(stockService.updateStockByProductIdAsync).toHaveBeenCalledWith(
        1,
        { quantityAvailable: 5, quantityOrdered: 0, quantityReserved: 0 },
        txMock,
      );
      expect(
        stockChangeRepository.createManyStockChangeAsync,
      ).toHaveBeenCalled();
    });
    it('should update stock and create stock changes when new status is InPreparation, oldStatus is PaymentPending and payment is CreditDebitCard', async () => {
      // Arrange
      const order = {
        ...orderMock,
        paymentDetailId: PaymentTypeEnum.CreditDebitCard,
        id: 1,
      };
      const orderItems = [{ productId: 1, quantity: 2 }];
      const tx = txMock;

      jest
        .spyOn(service['stockService'], 'findByProductIdAsync')
        .mockResolvedValue(stockMock);
      jest
        .spyOn(service['stockService'], 'updateStockByProductIdAsync')
        .mockResolvedValue(undefined);
      jest
        .spyOn(service['stockChangeRepository'], 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      // Act
      await service['manageStockChanges'](
        order,
        orderItems,
        PaymentTypeEnum.CreditDebitCard,
        OrderStatusId.PaymentPending,
        OrderStatusId.InPreparation,
        tx,
      );

      // Assert
      expect(service['stockService'].findByProductIdAsync).toHaveBeenCalledWith(
        1,
        tx,
      );
      expect(
        service['stockService'].updateStockByProductIdAsync,
      ).toHaveBeenCalledWith(
        1,
        {
          quantityAvailable: stockMock.quantityAvailable - 2,
          quantityOrdered: stockMock.quantityOrdered,
          quantityReserved: stockMock.quantityReserved + 2,
        },
        tx,
      );
      expect(
        service['stockChangeRepository'].createManyStockChangeAsync,
      ).toHaveBeenCalled();
    });

    it('should update stock and create stock changes when new status is InPreparation, oldStatus is null and payment is UponDelivery', async () => {
      // Arrange
      const order = {
        ...orderMock,
        paymentDetailId: PaymentTypeEnum.UponDelivery,
        id: 1,
      };
      const orderItems = [{ productId: 1, quantity: 2 }];
      const tx = txMock;

      jest
        .spyOn(service['stockService'], 'findByProductIdAsync')
        .mockResolvedValue(stockMock);
      jest
        .spyOn(service['stockService'], 'updateStockByProductIdAsync')
        .mockResolvedValue(undefined);
      jest
        .spyOn(service['stockChangeRepository'], 'createManyStockChangeAsync')
        .mockResolvedValue(undefined);

      // Act
      await service['manageStockChanges'](
        order,
        orderItems,
        PaymentTypeEnum.UponDelivery,
        null,
        OrderStatusId.InPreparation,
        tx,
      );

      // Assert
      expect(service['stockService'].findByProductIdAsync).toHaveBeenCalledWith(
        1,
        tx,
      );
      expect(
        service['stockService'].updateStockByProductIdAsync,
      ).toHaveBeenCalledWith(
        1,
        {
          quantityAvailable: stockMock.quantityAvailable - 2,
          quantityOrdered: stockMock.quantityOrdered,
          quantityReserved: stockMock.quantityReserved + 2,
        },
        tx,
      );
      expect(
        service['stockChangeRepository'].createManyStockChangeAsync,
      ).toHaveBeenCalled();
    });
  });
  describe('findOrderByIdAsync', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      // Arrange
      const id = 999;
      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findOrderByIdAsync(id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return order details with items', async () => {
      // Arrange
      const orderItemsMock = [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          unitPrice: new Prisma.Decimal(10.0),
          quantity: 5,
          subtotalPrice: new Prisma.Decimal(50.0),
          product: {
            id: 1,
            name: 'Test Product',
            description: 'Producto de prueba',
            price: new Prisma.Decimal(10.0),
            enabled: true,
            weight: new Prisma.Decimal(1.5),
            imageUrl: 'https://test.com/image.jpg',
            categoryId: 1,
            supplierId: 1,
            deletedAt: null,
            category: {
              id: 1,
              name: 'Test Category',
              description: 'Categoría de prueba',
            },
            supplier: {
              id: 1,
              addressId: 1,
              email: 'proveedor@test.com',
              phone: '123456789',
              documentType: 'CUIT',
              documentNumber: '20123456789',
              businessName: 'Proveedor S.A.',
            },
            stock: {
              id: 1,
              productId: 1,
              quantityOrdered: 10,
              quantityAvailable: 100,
              quantityReserved: 5,
            },
          },
        },
      ];

      const orderMock = {
        id: 1,
        clientId: 1,
        orderStatusId: 1,
        paymentDetailId: 1,
        deliveryMethodId: 1,
        shipmentId: 1,
        client: {
          id: 1,
          companyName: 'Test Company',
          user: {
            id: 1,
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'juan@mail.com',
            password: 'test-password',
            phone: '123456789',
            documentType: 'DNI',
            documentNumber: '12345678',
            birthdate: new Date('1990-01-01'),
            roleId: 2,
            accountLockedUntil: null,
            failedLoginAttempts: 0,
          },
          address: {
            id: 1,
            street: 'Calle Falsa',
            streetNumber: 123,
            townId: 1,
          },
          taxCategory: {
            id: 1,
            name: 'Responsable Inscripto',
            description: '',
          },
          userId: 1,
          taxCategoryId: 1,
          addressId: 1,
        },
        deliveryMethod: {
          id: 1,
          name: 'Delivery',
          description: 'Envío a domicilio',
        },
        orderStatus: {
          id: 1,
          name: 'Pendiente',
        },
        paymentDetail: {
          paymentType: {
            id: 1,
            name: 'Efectivo',
            description: null,
          },
          id: 1,
          paymentTypeId: 1,
        },
        orderItems: orderItemsMock,
        totalAmount: new Prisma.Decimal(105),
        createdAt: new Date(),
      };

      const orderDetailsDtoMock = {
        id: 1,
        client: {
          companyName: 'Test Company',
          user: {
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'juan@mail.com',
            phone: '123456789',
          },
          address: {
            street: 'Calle Falsa',
            streetNumber: 123,
          },
          taxCategory: {
            name: 'Responsable Inscripto',
            description: '',
          },
        },
        deliveryMethodName: 'Delivery',
        orderStatus: {
          name: 'Pendiente',
        },
        paymentDetail: {
          paymentType: {
            name: 'Efectivo',
          },
        },
        orderItems: [
          {
            id: 1,
            orderId: 1,
            product: {
              name: 'Test Product',
              description: 'Producto de prueba',
              price: 10,
              enabled: true,
              weight: 1.5,
              category: {
                name: 'Test Category',
              },
              stock: {
                quantityOrdered: 10,
                quantityAvailable: 100,
                quantityReserved: 5,
              },
              supplier: {
                businessName: 'Proveedor S.A.',
                email: 'proveedor@test.com',
                phone: '123456789',
              },
            },
            unitPrice: 10,
            quantity: 5,
            subtotalPrice: 50,
          },
        ],
        totalAmount: 105,
        createdAt: orderMock.createdAt,
      };

      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce(orderMock);

      jest
        .spyOn(orderItemRepository, 'findByOrderIdAsync')
        .mockResolvedValueOnce(orderItemsMock);

      // Act
      const result = await service.findOrderByIdAsync(1);

      // Assert
      expect(result).toEqual(orderDetailsDtoMock);
    });
  });

  describe('findOrderByIdForClientAsync', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      // Arrange

      const id = 999;
      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findOrderByIdAsync(id)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw NotFoundException if order does not exist for this client', async () => {
      // Arrange
      const orderItemsMock = [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          unitPrice: new Prisma.Decimal(10.0),
          quantity: 5,
          subtotalPrice: new Prisma.Decimal(50.0),
          product: {
            id: 1,
            name: 'Test Product',
            description: 'Producto de prueba',
            price: new Prisma.Decimal(10.0),
            enabled: true,
            weight: new Prisma.Decimal(1.5),
            imageUrl: 'https://test.com/image.jpg',
            categoryId: 1,
            supplierId: 1,
            deletedAt: null,
            category: {
              id: 1,
              name: 'Test Category',
              description: 'Categoría de prueba',
            },
            supplier: {
              id: 1,
              addressId: 1,
              email: 'proveedor@test.com',
              phone: '123456789',
              documentType: 'CUIT',
              documentNumber: '20123456789',
              businessName: 'Proveedor S.A.',
            },
            stock: {
              id: 1,
              productId: 1,
              quantityOrdered: 10,
              quantityAvailable: 100,
              quantityReserved: 5,
            },
          },
        },
      ];
      const orderMock = {
        id: 1,
        clientId: 1,
        orderStatusId: 1,
        paymentDetailId: 1,
        deliveryMethodId: 1,
        shipmentId: 1,
        client: {
          id: 1,
          companyName: 'Test Company',
          user: {
            id: 1,
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'juan@mail.com',
            password: 'test-password',
            phone: '123456789',
            documentType: 'DNI',
            documentNumber: '12345678',
            birthdate: new Date('1990-01-01'),
            roleId: 2,
            accountLockedUntil: null,
            failedLoginAttempts: 0,
          },
          address: {
            id: 1,
            street: 'Calle Falsa',
            streetNumber: 123,
            townId: 1,
          },
          taxCategory: {
            id: 1,
            name: 'Responsable Inscripto',
            description: '',
          },
          userId: 1,
          taxCategoryId: 1,
          addressId: 1,
        },
        deliveryMethod: {
          id: 1,
          name: 'Delivery',
          description: 'Envío a domicilio',
        },
        orderStatus: {
          id: 1,
          name: 'Pending',
        },
        paymentDetail: {
          paymentType: {
            id: 1,
            name: 'Efectivo',
            description: null,
          },
          id: 1,
          paymentTypeId: 1,
        },
        orderItems: orderItemsMock,
        totalAmount: new Prisma.Decimal(105),
        createdAt: new Date(),
      };
      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce(orderMock);

      // Act & Assert
      await expect(service.findOrderByIdForClientAsync(1, 123)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should return order details with items', async () => {
      // Arrange
      const orderItemsMock = [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          unitPrice: new Prisma.Decimal(10.0),
          quantity: 5,
          subtotalPrice: new Prisma.Decimal(50.0),
          product: {
            id: 1,
            name: 'Test Product',
            description: 'Producto de prueba',
            price: new Prisma.Decimal(10.0),
            enabled: true,
            weight: new Prisma.Decimal(1.5),
            imageUrl: 'https://test.com/image.jpg',
            categoryId: 1,
            supplierId: 1,
            deletedAt: null,
            category: {
              id: 1,
              name: 'Test Category',
              description: 'Categoría de prueba',
            },
            supplier: {
              id: 1,
              addressId: 1,
              email: 'proveedor@test.com',
              phone: '123456789',
              documentType: 'CUIT',
              documentNumber: '20123456789',
              businessName: 'Proveedor S.A.',
            },
            stock: {
              id: 1,
              productId: 1,
              quantityOrdered: 10,
              quantityAvailable: 100,
              quantityReserved: 5,
            },
          },
        },
      ];

      const orderMock = {
        id: 1,
        clientId: 1,
        orderStatusId: 1,
        paymentDetailId: 1,
        deliveryMethodId: 1,
        shipmentId: 1,
        client: {
          id: 1,
          companyName: 'Test Company',
          user: {
            id: 1,
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'juan@mail.com',
            password: 'test-password',
            phone: '123456789',
            documentType: 'DNI',
            documentNumber: '12345678',
            birthdate: new Date('1990-01-01'),
            roleId: 2,
            accountLockedUntil: null,
            failedLoginAttempts: 0,
          },
          address: {
            id: 1,
            street: 'Calle Falsa',
            streetNumber: 123,
            townId: 1,
          },
          taxCategory: {
            id: 1,
            name: 'Responsable Inscripto',
            description: '',
          },
          userId: 1,
          taxCategoryId: 1,
          addressId: 1,
        },
        deliveryMethod: {
          id: 1,
          name: 'Delivery',
          description: 'Envío a domicilio',
        },
        orderStatus: {
          id: 1,
          name: 'Pendiente',
        },
        paymentDetail: {
          paymentType: {
            id: 1,
            name: 'Efectivo',
            description: null,
          },
          id: 1,
          paymentTypeId: 1,
        },
        orderItems: orderItemsMock,
        totalAmount: new Prisma.Decimal(105),
        createdAt: new Date(),
      };

      const orderDetailsDtoMock = {
        id: 1,
        client: {
          companyName: 'Test Company',
          user: {
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'juan@mail.com',
            phone: '123456789',
          },
          address: {
            street: 'Calle Falsa',
            streetNumber: 123,
          },
          taxCategory: {
            name: 'Responsable Inscripto',
            description: '',
          },
        },
        deliveryMethodName: 'Delivery',
        deliveryMethodId: 1,
        orderStatus: {
          name: 'Pendiente',
        },
        paymentDetail: {
          paymentType: {
            name: 'Efectivo',
          },
        },
        orderItems: [
          {
            id: 1,
            product: {
              name: 'Test Product',
              description: 'Producto de prueba',
              price: 10,
              weight: 1.5,
              category: {
                name: 'Test Category',
              },
            },
            unitPrice: 10,
            quantity: 5,
            subtotalPrice: 50,
          },
        ],
        totalAmount: 105,
        createdAt: orderMock.createdAt,
      };

      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce(orderMock);

      jest
        .spyOn(orderItemRepository, 'findByOrderIdAsync')
        .mockResolvedValueOnce(orderItemsMock);

      // Act
      const result = await service.findOrderByIdForClientAsync(
        1,
        orderMock.clientId,
      );

      // Assert
      expect(result).toEqual(orderDetailsDtoMock);
    });
  });

  describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchOrderFiltersDto = {
        statusName: ['Pending'],
        fromCreatedAtDate: '2025-01-01',
        toCreatedAtDate: '2025-12-31',
      };
      const orderBy = {
        field: OrderField.CREATED_AT,
        direction: OrderDirection.ASC,
      };
      const page = 1;
      const pageSize = 10;
      const query = new SearchOrderQuery({
        searchText,
        filters,
        page,
        pageSize,
        orderBy,
      });

      // Act
      await service.searchWithFiltersAsync(query);

      // Assert
      expect(orderRepository.searchWithFiltersAsync).toHaveBeenCalledWith(
        query.page,
        query.pageSize,
        query.searchText,
        query.filters,
        query.orderBy,
      );
    });
  });

  describe('downloadWithFiltersAsync', () => {
    it('should call downloadWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchOrderFiltersDto = {
        statusName: ['Pending'],
        fromCreatedAtDate: '2025-01-01',
        toCreatedAtDate: '2025-12-31',
      };
      const orderBy = {
        field: OrderField.CREATED_AT,
        direction: OrderDirection.ASC,
      };
      const query = new DownloadOrderQuery({
        searchText,
        filters,
        orderBy,
      });

      // Act
      await service.downloadWithFiltersAsync(query);

      // Assert
      expect(orderRepository.downloadWithFiltersAsync).toHaveBeenCalledWith(
        query.searchText,
        query.filters,
        query.orderBy,
      );
    });
  });

  describe('sendBillByEmailAsync', () => {
    const billReportGenerationDataDto = {
      billId: 1,
      createdAt: new Date('1990-01-31'),
      orderId: 1,
      clientCompanyName: 'Test Client',
      clientAddress: 'Calle Falsa 123',
      clientDocumentType: 'DNI',
      clientDocumentNumber: '12345678',
      clientTaxCategory: 'Responsable Inscripto',
      deliveryMethod: 'Delivery',
      orderStatus: 'Prepared',
      totalAmount: new Decimal(20.0),
      orderItems: [
        {
          productName: 'Test Product',
          quantity: 2,
          unitPrice: new Decimal(10.0),
          subtotalPrice: new Decimal(20.0),
        },
      ],
      paid: true,
      paymentType: 'Efectivo',
      observation: 'Test Observation',
    };
    const orderDetailsDtoMock = {
      id: 1,
      client: {
        companyName: 'Test Company',
        user: {
          firstName: 'Juan',
          lastName: 'Perez',
          email: 'juan@mail.com',
          phone: '123456789',
        },
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
        },
        taxCategory: {
          name: 'Responsable Inscripto',
          description: '',
        },
      },
      deliveryMethodName: 'Delivery',
      deliveryMethodId: 1,
      orderStatus: {
        name: 'Pendiente',
      },
      paymentDetail: {
        paymentType: {
          name: 'Efectivo',
        },
      },
      orderItems: [
        {
          id: 1,
          orderId: 1,
          product: {
            name: 'Test Product',
            description: 'Producto de prueba',
            price: 10,
            weight: 1.5,
            enabled: true,
            imageUrl: 'https://test.com/image.jpg',
            category: {
              name: 'Test Category',
            },
            stock: {
              quantityOrdered: 10,
              quantityAvailable: 100,
              quantityReserved: 5,
            },
            supplier: {
              businessName: 'Proveedor S.A.',
              email: 'proveedor@test.com',
              phone: '123456789',
            },
          },
          unitPrice: 10,
          quantity: 5,
          subtotalPrice: 50,
        },
      ],
      totalAmount: 105,
      createdAt: orderMock.createdAt,
    };
    it('should call reportService.generateBillReport with the correct parameters', async () => {
      // Arrange
      const billReportGenerationDataDto = {
        billId: 1,
        createdAt: new Date('1990-01-31'),
        orderId: 1,
        clientCompanyName: 'Test Client',
        clientAddress: 'Calle Falsa 123',
        clientDocumentType: 'DNI',
        clientDocumentNumber: '12345678',
        clientTaxCategory: 'Responsable Inscripto',
        deliveryMethod: 'Delivery',
        orderStatus: 'Prepared',
        totalAmount: new Prisma.Decimal(20.0),
        orderItems: [
          {
            productName: 'Test Product',
            quantity: 2,
            unitPrice: new Prisma.Decimal(10.0),
            subtotalPrice: new Prisma.Decimal(20.0),
          },
        ],
        paid: true,
        paymentType: 'Efectivo',
        observation: 'Test Observation',
      };

      const newStatus = OrderStatusId.Finished;
      const clientEmail = 'client@test.com';

      const fakePdfStream = new PassThrough() as unknown as PDFKit.PDFDocument;
      setImmediate(() => {
        fakePdfStream.end();
      });

      jest
        .spyOn(reportService, 'generateBillReport')
        .mockResolvedValueOnce(fakePdfStream);

      jest
        .spyOn(mailingService, 'sendMailWithAttachmentAsync')
        .mockResolvedValueOnce(undefined);

      // Act
      await service.sendBillByEmailAsync(
        orderDetailsDtoMock,
        newStatus,
        billReportGenerationDataDto,
        clientEmail,
      );

      // Assert
      expect(reportService.generateBillReport).toHaveBeenCalledWith(
        billReportGenerationDataDto,
      );
    });

    it('should call mailingService.sendMailWithAttachmentAsync with the correct parameters', async () => {
      // Arrange
      const billReportGenerationDataDto = {
        billId: 1,
        createdAt: new Date('1990-01-31'),
        orderId: 1,
        clientCompanyName: 'Test Client',
        clientAddress: 'Calle Falsa 123',
        clientDocumentType: 'DNI',
        clientDocumentNumber: '12345678',
        clientTaxCategory: 'Responsable Inscripto',
        deliveryMethod: 'Delivery',
        orderStatus: 'Prepared',
        totalAmount: new Prisma.Decimal(20.0),
        orderItems: [
          {
            productName: 'Test Product',
            quantity: 2,
            unitPrice: new Prisma.Decimal(10.0),
            subtotalPrice: new Prisma.Decimal(20.0),
          },
        ],
        paid: true,
        paymentType: 'Efectivo',
        observation: 'Test Observation',
      };
      const newStatus = OrderStatusId.Finished;
      const clientEmail = 'client@test.com';

      const fakePdfStream = new PassThrough() as unknown as PDFKit.PDFDocument;
      setImmediate(() => {
        fakePdfStream.end();
      });

      jest
        .spyOn(reportService, 'generateBillReport')
        .mockResolvedValueOnce(fakePdfStream);

      jest
        .spyOn(mailingService, 'sendMailWithAttachmentAsync')
        .mockResolvedValueOnce(undefined);

      // Act
      await service.sendBillByEmailAsync(
        orderDetailsDtoMock,
        newStatus,
        billReportGenerationDataDto,
        clientEmail,
      );

      // Assert
      expect(mailingService.sendMailWithAttachmentAsync).toHaveBeenCalledWith(
        clientEmail,
        `Factura #${billReportGenerationDataDto.billId}`,
        expect.stringContaining(
          'Te dejamos tu factura en PDF adjunta a este correo.',
        ),
        {
          filename: `MP-FC-${billReportGenerationDataDto.billId}.pdf`,
          content: expect.any(Buffer),
        },
      );
    });
    it('should throw if reportService.generateBillReport fails', async () => {
      // Arrange
      jest
        .spyOn(reportService, 'generateBillReport')
        .mockRejectedValueOnce(new Error('PDF error'));

      // Act & Assert
      await expect(
        service.sendBillByEmailAsync(
          orderDetailsDtoMock,
          OrderStatusId.Finished,
          billReportGenerationDataDto,
          'client@test.com',
        ),
      ).rejects.toThrow('PDF error');
    });
    it('should throw if mailingService.sendMailWithAttachmentAsync fails', async () => {
      // Arrange
      const fakePdfStream = new PassThrough() as unknown as PDFKit.PDFDocument;
      setImmediate(() => fakePdfStream.end());
      jest
        .spyOn(reportService, 'generateBillReport')
        .mockResolvedValueOnce(fakePdfStream);
      jest
        .spyOn(mailingService, 'sendMailWithAttachmentAsync')
        .mockRejectedValueOnce(new Error('Mail error'));

      // Act & Assert
      await expect(
        service.sendBillByEmailAsync(
          orderDetailsDtoMock,
          OrderStatusId.Finished,
          billReportGenerationDataDto,
          'client@test.com',
        ),
      ).rejects.toThrow('Mail error');
    });
  });
  describe('sendOrderStatusChangeEmailAsync', () => {
    const orderDetailsDtoMock = {
      id: 1,
      client: {
        companyName: 'Test Company',
        user: {
          firstName: 'Juan',
          lastName: 'Perez',
          email: 'juan@mail.com',
          phone: '123456789',
        },
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
        },
        taxCategory: {
          name: 'Responsable Inscripto',
          description: '',
        },
      },
      deliveryMethodName: 'Delivery',
      deliveryMethodId: 1,
      orderStatus: {
        name: 'Pendiente',
      },
      paymentDetail: {
        paymentType: {
          name: 'Efectivo',
        },
      },
      orderItems: [
        {
          id: 1,
          orderId: 1,
          product: {
            name: 'Test Product',
            description: 'Producto de prueba',
            price: 10,
            weight: 1.5,
            enabled: true,
            imageUrl: 'https://test.com/image.jpg',
            category: {
              name: 'Test Category',
            },
            stock: {
              quantityOrdered: 10,
              quantityAvailable: 100,
              quantityReserved: 5,
            },
            supplier: {
              businessName: 'Proveedor S.A.',
              email: 'proveedor@test.com',
              phone: '123456789',
            },
          },
          unitPrice: 10,
          quantity: 5,
          subtotalPrice: 50,
        },
      ],
      totalAmount: 105,
      createdAt: new Date(),
    };

    it('should send a mail with correct HTML and subject', async () => {
      // Arrange
      const newStatus = OrderStatusId.Shipped;
      const sendMailSpy = jest
        .spyOn(mailingService, 'sendNewStatusMailAsync')
        .mockResolvedValueOnce(undefined);

      // Act
      await service.sendOrderStatusChangeEmailAsync(
        orderDetailsDtoMock,
        newStatus,
      );

      // Assert
      expect(sendMailSpy).toHaveBeenCalledWith(
        orderDetailsDtoMock.client.user.email,
        `Estado actualizado: Enviado`,
        expect.stringContaining('<div class="estado">Enviado</div>'),
      );
    });

    it('should not send mail if client email is missing', async () => {
      // Arrange
      jest.clearAllMocks();
      const orderWithoutEmail = JSON.parse(JSON.stringify(orderDetailsDtoMock));
      orderWithoutEmail.client.user.email = '';
      const newStatus = OrderStatusId.Shipped;
      const sendMailSpy = jest.spyOn(mailingService, 'sendNewStatusMailAsync');

      // Act
      await service.sendOrderStatusChangeEmailAsync(
        orderWithoutEmail,
        newStatus,
      );

      // Assert
      expect(sendMailSpy).not.toHaveBeenCalled();
    });
    it('should throw if mailingService.sendNewStatusMailAsync fails', async () => {
      // Arrange
      const newStatus = OrderStatusId.Shipped;
      jest
        .spyOn(mailingService, 'sendNewStatusMailAsync')
        .mockRejectedValueOnce(new Error('Mail error'));

      // Act & Assert
      await expect(
        service.sendOrderStatusChangeEmailAsync(orderDetailsDtoMock, newStatus),
      ).rejects.toThrow('Mail error');
    });

    it('should include the correct status in the HTML', async () => {
      // Arrange
      const newStatus = OrderStatusId.Shipped;
      jest
        .spyOn(mailingService, 'sendNewStatusMailAsync')
        .mockResolvedValueOnce(undefined);

      // Act
      await service.sendOrderStatusChangeEmailAsync(
        orderDetailsDtoMock,
        newStatus,
      );

      // Assert
      const htmlArg = (mailingService.sendNewStatusMailAsync as jest.Mock).mock
        .calls[0][2];
      expect(htmlArg).toContain('<div class="estado">Enviado</div>');
      expect(htmlArg).toContain('Test Company');
      expect(htmlArg).toContain('#1');
    });
  });
});
