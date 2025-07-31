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
  describe('searchWithFiltersAsync', () => {
    it('should return filtered purchase orders with pagination', async () => {
      // Arrange
      const filters = {
        statusId: [1, 2],
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
        fromDeliveryDate: '2023-06-01',
        toDeliveryDate: '2023-06-30',
      };

      const page = 1;
      const pageSize = 10;
      const searchText = 'Test Supplier';

      const mockData = [purchaseOrder];
      const mockTotal = 1;

      jest
        .spyOn(prismaService.purchaseOrder, 'findMany')
        .mockResolvedValueOnce(mockData);
      jest
        .spyOn(prismaService.purchaseOrder, 'count')
        .mockResolvedValueOnce(mockTotal);

      // Act
      const result = await repository.searchWithFiltersAsync(
        page,
        pageSize,
        searchText,
        filters,
      );

      // Assert
      expect(prismaService.purchaseOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { purchaseOrderStatusId: { in: filters.statusId } },
              { createdAt: { gte: new Date(filters.fromDate) } },
              { createdAt: { lte: new Date(filters.toDate) } },
              {
                effectiveDeliveryDate: {
                  gte: new Date(filters.fromDeliveryDate),
                },
              },
              {
                effectiveDeliveryDate: {
                  lte: new Date(filters.toDeliveryDate),
                },
              },
              {
                OR: expect.arrayContaining([
                  {
                    supplier: {
                      businessName: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  },
                ]),
              },
            ]),
          }),
          skip: 0,
          take: 10,
        }),
      );

      expect(prismaService.purchaseOrder.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        }),
      );

      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
      });
    });
  });
});
