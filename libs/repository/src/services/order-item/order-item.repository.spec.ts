import { Test, TestingModule } from '@nestjs/testing';
import { OrderItem, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { OrderItemRepository } from '@mp/repository';

import { PrismaService } from '../prisma.service';
describe('PurchaseOrderItemRepository', () => {
  let repository: OrderItemRepository;
  let prismaService: PrismaService;
  let orderItem: ReturnType<typeof mockDeep<OrderItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderItemRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<OrderItemRepository>(OrderItemRepository);

    orderItem = mockDeep<OrderItem>();

    orderItem.id = 1;
    orderItem.productId = 1;
    orderItem.quantity = 10;
    orderItem.unitPrice = mockDeep<Prisma.Decimal>();
    orderItem.orderId = 1;
    orderItem.subtotalPrice = mockDeep<Prisma.Decimal>();
  });

  describe('createManyOrderItemAsync', () => {
    it('should create multiple order items with the provided data', async () => {
      // Arrange
      const orderItemsDataMock = [
        {
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          orderId: orderItem.orderId,
          subtotalPrice: orderItem.subtotalPrice,
        },
      ];
      jest
        .spyOn(prismaService.orderItem, 'createMany')
        .mockResolvedValueOnce({ count: orderItemsDataMock.length });

      // Act
      const result =
        await repository.createManyOrderItemAsync(orderItemsDataMock);

      // Assert
      expect(result).toEqual({ count: orderItemsDataMock.length });
    });

    it('should call prisma.orderItem.createMany with correct data', async () => {
      // Arrange
      const orderItemsDataMock = [
        {
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          orderId: orderItem.orderId,
          subtotalPrice: orderItem.subtotalPrice,
        },
      ];

      jest
        .spyOn(prismaService.orderItem, 'createMany')
        .mockResolvedValueOnce({ count: orderItemsDataMock.length });

      // Act
      await repository.createManyOrderItemAsync(orderItemsDataMock);

      // Assert
      expect(prismaService.orderItem.createMany).toHaveBeenCalledWith({
        data: orderItemsDataMock,
      });
    });
  });
});
