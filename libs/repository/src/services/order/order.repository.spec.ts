import { Test, TestingModule } from '@nestjs/testing';
import { Order, Prisma } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';
import { mockDeep } from 'jest-mock-extended';

import { OrderDirection, OrderField } from '@mp/common/constants';
import { SearchOrderFromClientFiltersDto } from '@mp/common/dtos';
import { orderDataMock } from '@mp/common/testing';

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
  describe('searchClientOrdersWithFiltersAsync', () => {
    const clientId = 1;
    const filters: SearchOrderFromClientFiltersDto = {
      statusName: ['Pending', 'Cancelled'],
      deliveryMethod: [1],
      fromDate: '2023-01-01',
      toDate: '2023-12-31',
    };
    const page = 1;
    const pageSize = 10;
    const searchText = '1';
    const orderBy = {
      field: OrderField.CREATED_AT,
      direction: OrderDirection.DESC,
    };
    const mockData = [order];
    const mockTotal = 1;

    beforeEach(() => {
      jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(mockData);
      jest.spyOn(prismaService.order, 'count').mockResolvedValue(mockTotal);
    });

    it('should call prisma.order.findMany with correct filters, pagination and order', async () => {
      // Act
      await repository.searchClientOrdersWithFiltersAsync(
        clientId,
        page,
        pageSize,
        searchText,
        filters,
        orderBy,
      );

      // Assert
      expect(prismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { clientId },
              { orderStatus: { name: { in: filters.statusName } } },
              { deliveryMethod: { id: { in: filters.deliveryMethod } } },
              {
                createdAt: {
                  gte: filters.fromDate
                    ? new Date(filters.fromDate)
                    : undefined,
                },
              },
              {
                createdAt: {
                  lte: filters.toDate
                    ? endOfDay(parseISO(filters.toDate))
                    : undefined,
                },
              },
              {
                OR: expect.arrayContaining([
                  {
                    orderStatus: {
                      name: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  },
                  { id: Number(searchText) },
                ]),
              },
            ]),
          }),
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        }),
      );
    });
    it('should call prisma.order.count with same filters', async () => {
      // Act
      await repository.searchClientOrdersWithFiltersAsync(
        clientId,
        page,
        pageSize,
        searchText,
        filters,
        orderBy,
      );

      // Assert
      expect(prismaService.order.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        }),
      );
    });

    it('should return data and total from prisma results', async () => {
      // Act
      const result = await repository.searchClientOrdersWithFiltersAsync(
        clientId,
        page,
        pageSize,
        searchText,
        filters,
        orderBy,
      );

      // Assert
      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
      });
    });
  });

  describe('getByIdAsync', () => {
    it('should call prisma.order.findUnique with correct id and include orderItems with product', async () => {
      // Arrange
      const orderId = 1;
      const expectedOrder = mockDeep<
        Prisma.OrderGetPayload<{
          include: { orderItems: { include: { product: true } } };
        }>
      >();
      jest
        .spyOn(prismaService.order, 'findUnique')
        .mockResolvedValue(expectedOrder);

      // Act
      const result = await repository.getByIdAsync(orderId);

      // Assert
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result).toBe(expectedOrder);
    });

    it('should return null if no order is found', async () => {
      // Arrange
      const orderId = 999;
      jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await repository.getByIdAsync(orderId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
