import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PurchaseOrder } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { PurchaseOrderRepository } from './purchase-order.repository';

describe('PurchaseOrderRepository', () => {
  let repository: PurchaseOrderRepository;
  let prismaService: PrismaService;
  let purchaseOrder: ReturnType<typeof mockDeep<PurchaseOrder>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<PurchaseOrderRepository>(PurchaseOrderRepository);

    purchaseOrder = mockDeep<PurchaseOrder>();

    purchaseOrder.id = 1;
    purchaseOrder.estimatedDeliveryDate = mockDeep<Date>(
      new Date('2023-10-01'),
    );
    purchaseOrder.purchaseOrderStatusId = 4;
    purchaseOrder.totalAmount = mockDeep<Prisma.Decimal>();
    purchaseOrder.supplierId = 1;
    purchaseOrder.observation = 'Test observation';
    purchaseOrder.effectiveDeliveryDate = mockDeep<Date>();
    purchaseOrder.createdAt = mockDeep<Date>();
  });

  describe('createPurchaseOrderAsync', () => {
    it('should create a purchase order with the provided data', async () => {
      // Arrange
      const purchaseOrderDataMock: PurchaseOrderDataDto = {
        supplierId: 1,
        estimatedDeliveryDate: mockDeep<Date>(new Date('2023-10-01')),
        observation: 'Test observation',
        totalAmount: 100.5,
        purchaseOrderStatusId: 4,
      };
      jest
        .spyOn(prismaService.purchaseOrder, 'create')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      const result = await repository.createPurchaseOrderAsync(
        purchaseOrderDataMock,
      );

      // Assert
      expect(result).toEqual(purchaseOrder);
    });

    it('should call prisma.purchaseOrder.create with correct data', async () => {
      // Arrange
      const purchaseOrderDataMock: PurchaseOrderDataDto = {
        supplierId: 1,
        estimatedDeliveryDate: mockDeep<Date>(new Date('2023-10-01')),
        observation: 'Test observation',
        totalAmount: 100.5,
        purchaseOrderStatusId: 4,
      };

      jest
        .spyOn(prismaService.purchaseOrder, 'create')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      await repository.createPurchaseOrderAsync(purchaseOrderDataMock);

      // Assert
      expect(prismaService.purchaseOrder.create).toHaveBeenCalledWith({
        data: {
          ...purchaseOrderDataMock,
        },
      });
    });
  });

  describe('findByIdWithSupplierAndStatusAsync', () => {
    it('should return a purchase order with supplier and status by id', async () => {
      // Arrange
      const purchaseOrderId = 1;
      jest
        .spyOn(prismaService.purchaseOrder, 'findUnique')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      const result =
        await repository.findByIdWithSupplierAndStatusAsync(purchaseOrderId);

      // Assert
      expect(result).toEqual(purchaseOrder);
    });

    it('should call prisma.purchaseOrder.findUnique with correct id and include options', async () => {
      // Arrange
      const purchaseOrderId = 1;

      jest
        .spyOn(prismaService.purchaseOrder, 'findUnique')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      await repository.findByIdWithSupplierAndStatusAsync(purchaseOrderId);

      // Assert
      expect(prismaService.purchaseOrder.findUnique).toHaveBeenCalledWith({
        where: { id: purchaseOrderId },
        include: { supplier: true, purchaseOrderStatus: true },
      });
    });
  });
});
