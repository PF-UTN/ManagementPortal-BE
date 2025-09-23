import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { OrderStatusId } from '@mp/common/constants';
import {
  clientMock,
  mockOrderItem,
  mockPaymentDetail,
  orderCreationDtoMock,
  orderFullMock,
  orderMock,
  stockMock,
  txMock,
} from '@mp/common/testing';
import {
  OrderItemRepository,
  OrderRepository,
  PaymentDetailRepository,
  PrismaUnitOfWork,
  ProductRepository,
  StockChangeRepository,
} from '@mp/repository';

import { OrderService } from './order.service';
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
    it('should throw if order status is not Pending', async () => {
      // Arrange
      const dto = {
        ...orderCreationDtoMock,
        orderStatusId: OrderStatusId.Shipped,
      };
      jest
        .spyOn(clientService, 'findClientByIdAsync')
        .mockResolvedValueOnce(clientMock);

      // Act & Assert
      await expect(service.createOrderAsync(dto)).rejects.toThrow(
        'Invalid order status. Only PENDING orders can be created.',
      );
    });

    it('should throw BadRequestException if no products are provided', async () => {
      // Arrange
      const dto = { ...orderCreationDtoMock, orderItems: [] };
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
        service.createOrderAsync(orderCreationDtoMock),
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
        service.createOrderAsync(orderCreationDtoMock),
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
        service.createOrderAsync(orderCreationDtoMock),
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
        .spyOn(orderRepository, 'createOrderAsync')
        .mockResolvedValueOnce(orderMock);
      jest
        .spyOn(paymentDetailRepository, 'createPaymentDetailAsync')
        .mockResolvedValue({
          id: 1,
          paymentTypeId: orderCreationDtoMock.paymentDetail.paymentTypeId,
        });

      // Act
      await service.createOrderAsync(orderCreationDtoMock);

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
      await service.createOrderAsync(orderCreationDtoMock);

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
      await service.createOrderAsync(orderCreationDtoMock);

      // Assert
      expect(createManySpy).toHaveBeenCalledWith(mockOrderItem, txMock);
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
    // const orderItemsMock = [{ ...mockOrderItem, productId: 1, quantity: 5 }];

    beforeEach(() => {
      jest.clearAllMocks();
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

    it('should call updateStockByProductIdAsync and createManyStockChangeAsync when status is Delivered', async () => {
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
        OrderStatusId.Delivered,
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
  });
  describe('findOrderByIdAsync', () => {
    it('should call orderRepository.findOrderByIdAsync with the correct id', async () => {
      // Arrange
      const findSpy = jest.spyOn(orderRepository, 'findOrderByIdAsync');
      const orderId = 1;
      // Act
      await service.findOrderByIdAsync(orderId);
      // Assert
      expect(findSpy).toHaveBeenCalledWith(orderId);
    });
    it('should return the order from orderRepository.findOrderByIdAsync', async () => {
      // Arrange
      jest
        .spyOn(orderRepository, 'findOrderByIdAsync')
        .mockResolvedValueOnce(orderFullMock);
      const orderId = 1;
      // Act
      const result = await service.findOrderByIdAsync(orderId);
      // Assert
      expect(result).toEqual(orderFullMock);
    });
  });
});
