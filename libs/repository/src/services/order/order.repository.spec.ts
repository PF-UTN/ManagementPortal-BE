import { Test, TestingModule } from '@nestjs/testing';
import { Order, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { orderDataMock, orderFullMock } from '@mp/common/testing';

import { OrderRepository } from './order.repository';
import { PrismaService } from '../prisma.service';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let prismaService: PrismaService;
  let order: ReturnType<typeof mockDeep<Order>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    repository = module.get<OrderRepository>(OrderRepository);

    order = mockDeep<Order>();
    order.id = 1;
    order.clientId = 1;
    order.orderStatusId = 1;
    order.totalAmount = mockDeep<Prisma.Decimal>();
    order.createdAt = mockDeep<Date>();
  });

  describe('createOrderAsync', () => {
    it('should create an order with the provided data (without tx)', async () => {
      // Arrange

      jest.spyOn(prismaService.order, 'create').mockResolvedValueOnce(order);

      // Act
      const result = await repository.createOrderAsync(orderDataMock);

      // Assert
      expect(result).toEqual(order);
    });

    it('should call prisma.order.create with correct data (without tx)', async () => {
      // Arrange
      jest.spyOn(prismaService.order, 'create').mockResolvedValueOnce(order);

      // Act
      await repository.createOrderAsync(orderDataMock);

      // Assert
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: { ...orderDataMock },
      });
    });

    it('should call tx.order.create with correct data when tx is provided', async () => {
      // Arrange
      const txMock = {
        order: { create: jest.fn().mockResolvedValue(order) },
      } as unknown as Prisma.TransactionClient;

      // Act
      const result = await repository.createOrderAsync(orderDataMock, txMock);

      // Assert
      expect(txMock.order.create).toHaveBeenCalledWith({
        data: { ...orderDataMock },
      });
      expect(result).toEqual(order);
    });
  });
  describe('findOrderByIdAsync', () => {
    it('should find an order by id', async () => {
      // Arrange
      jest
        .spyOn(prismaService.order, 'findUnique')
        .mockResolvedValueOnce(orderFullMock);
      const orderId = 1;
      // Act
      const result = await repository.findOrderByIdAsync(orderId);

      // Assert
      expect(result).toEqual(orderFullMock);
    });
    it('should call prisma.order.findUnique with correct id', async () => {
      // Arrange
      jest
        .spyOn(prismaService.order, 'findUnique')
        .mockResolvedValueOnce(orderFullMock);
      const orderId = 1;
      // Act
      await repository.findOrderByIdAsync(orderId);
      // Assert
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          orderItems: true,
          orderStatus: true,
          client: true,
          deliveryMethod: true,
          paymentDetail: true,
        },
      });
    });
  });
});
