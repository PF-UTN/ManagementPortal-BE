import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PurchaseOrderItem } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../prisma.service';
import { PurchaseOrderItemRepository } from './purchase-order-item.repository';

describe('PurchaseOrderItemRepository', () => {
  let repository: PurchaseOrderItemRepository;
  let prismaService: PrismaService;
  let purchaseOrderItem: ReturnType<typeof mockDeep<PurchaseOrderItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderItemRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<PurchaseOrderItemRepository>(
      PurchaseOrderItemRepository,
    );

    purchaseOrderItem = mockDeep<PurchaseOrderItem>();

    purchaseOrderItem.id = 1;
    purchaseOrderItem.productId = 1;
    purchaseOrderItem.quantity = 10;
    purchaseOrderItem.unitPrice = mockDeep<Prisma.Decimal>();
    purchaseOrderItem.purchaseOrderId = 1;
    purchaseOrderItem.subtotalPrice = mockDeep<Prisma.Decimal>();
  });

  describe('createManyPurchaseOrderItemAsync', () => {
    it('should create multiple purchase order items with the provided data', async () => {
      // Arrange
      const purchaseOrderItemsDataMock = [
        {
          productId: purchaseOrderItem.productId,
          quantity: purchaseOrderItem.quantity,
          unitPrice: purchaseOrderItem.unitPrice,
          purchaseOrderId: purchaseOrderItem.purchaseOrderId,
          subtotalPrice: purchaseOrderItem.subtotalPrice,
        },
      ];
      jest
        .spyOn(prismaService.purchaseOrderItem, 'createMany')
        .mockResolvedValueOnce({ count: purchaseOrderItemsDataMock.length });

      // Act
      const result = await repository.createManyPurchaseOrderItemAsync(
        purchaseOrderItemsDataMock,
      );

      // Assert
      expect(result).toEqual({ count: purchaseOrderItemsDataMock.length });
    });

    it('should call prisma.purchaseOrderItem.createMany with correct data', async () => {
      // Arrange
      const purchaseOrderItemsDataMock = [
        {
          productId: purchaseOrderItem.productId,
          quantity: purchaseOrderItem.quantity,
          unitPrice: purchaseOrderItem.unitPrice,
          purchaseOrderId: purchaseOrderItem.purchaseOrderId,
          subtotalPrice: purchaseOrderItem.subtotalPrice,
        },
      ];

      jest
        .spyOn(prismaService.purchaseOrderItem, 'createMany')
        .mockResolvedValueOnce({ count: purchaseOrderItemsDataMock.length });

      // Act
      await repository.createManyPurchaseOrderItemAsync(
        purchaseOrderItemsDataMock,
      );

      // Assert
      expect(prismaService.purchaseOrderItem.createMany).toHaveBeenCalledWith({
        data: purchaseOrderItemsDataMock,
      });
    });
  });
});
