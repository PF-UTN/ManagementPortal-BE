import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';
import { mockDeep } from 'jest-mock-extended';

import {
  OrderDirection,
  PurchaseOrderField,
  PurchaseOrderStatusId,
} from '@mp/common/constants';
import { PurchaseOrderDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { PurchaseOrderRepository } from './purchase-order.repository';

describe('PurchaseOrderRepository', () => {
  let repository: PurchaseOrderRepository;
  let prismaService: PrismaService;
  let purchaseOrder: ReturnType<
    typeof mockDeep<
      Prisma.PurchaseOrderGetPayload<{
        include: {
          supplier: {
            select: {
              id: true;
              businessName: true;
            };
          };
          purchaseOrderStatus: {
            select: {
              id: true;
              name: true;
            };
          };
        };
      }>
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<PurchaseOrderRepository>(PurchaseOrderRepository);

    purchaseOrder = mockDeep<
      Prisma.PurchaseOrderGetPayload<{
        include: {
          supplier: {
            select: {
              id: true;
              businessName: true;
            };
          };
          purchaseOrderStatus: {
            select: {
              id: true;
              name: true;
            };
          };
        };
      }>
    >();

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
        where: {
          id: purchaseOrderId,
          purchaseOrderStatusId: { not: PurchaseOrderStatusId.Deleted },
        },
        include: { supplier: true, purchaseOrderStatus: true },
      });
    });
  });
  describe('searchWithFiltersAsync', () => {
    const filters = {
      statusId: [1, 2],
      supplierBusinessName: ['Supplier A', 'Supplier B'],
      fromDate: '2023-01-01',
      toDate: '2023-12-31',
      fromEffectiveDeliveryDate: '2023-06-01',
      toEffectiveDeliveryDate: '2023-06-30',
    };

    const page = 1;
    const pageSize = 10;
    const searchText = 'Test Supplier';

    const orderBy = {
      field: PurchaseOrderField.CREATED_AT,
      direction: OrderDirection.DESC,
    };

    const mockData = [purchaseOrder];
    const mockTotal = 1;

    beforeEach(() => {
      jest
        .spyOn(prismaService.purchaseOrder, 'findMany')
        .mockResolvedValue(mockData);
      jest
        .spyOn(prismaService.purchaseOrder, 'count')
        .mockResolvedValue(mockTotal);
    });

    it('should call prisma.purchaseOrder.findMany with correct filters, pagination and order', async () => {
      // Act
      await repository.searchWithFiltersAsync(
        page,
        pageSize,
        searchText,
        filters,
        orderBy,
      );

      // Assert
      expect(prismaService.purchaseOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            NOT: {
              purchaseOrderStatus: {
                name: 'Rejected',
              },
            },
            AND: expect.arrayContaining([
              { purchaseOrderStatusId: { in: filters.statusId } },
              { createdAt: { gte: new Date(filters.fromDate) } },
              { createdAt: { lte: endOfDay(parseISO(filters.toDate)) } },
              {
                effectiveDeliveryDate: {
                  gte: new Date(filters.fromEffectiveDeliveryDate),
                },
              },
              {
                effectiveDeliveryDate: {
                  lte: endOfDay(parseISO(filters.toEffectiveDeliveryDate)),
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
                  {
                    purchaseOrderStatus: {
                      name: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  },
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

    it('should call prisma.purchaseOrder.count with same filters', async () => {
      // Act
      await repository.searchWithFiltersAsync(
        page,
        pageSize,
        searchText,
        filters,
        orderBy,
      );

      // Assert
      expect(prismaService.purchaseOrder.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        }),
      );
    });

    it('should return data and total from prisma results', async () => {
      // Act
      const result = await repository.searchWithFiltersAsync(
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

  describe('findByIdAsync', () => {
    it('should return a purchase order by id', async () => {
      // Arrange
      const purchaseOrderId = 1;
      jest
        .spyOn(prismaService.purchaseOrder, 'findUnique')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      const result = await repository.findByIdAsync(purchaseOrderId);

      // Assert
      expect(result).toEqual(purchaseOrder);
    });

    it('should call prisma.purchaseOrder.findUnique with correct id', async () => {
      // Arrange
      const purchaseOrderId = 1;

      jest
        .spyOn(prismaService.purchaseOrder, 'findUnique')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      await repository.findByIdAsync(purchaseOrderId);

      // Assert
      expect(prismaService.purchaseOrder.findUnique).toHaveBeenCalledWith({
        where: {
          id: purchaseOrderId,
          purchaseOrderStatusId: { not: PurchaseOrderStatusId.Deleted },
        },
      });
    });
  });

  describe('existsAsync', () => {
    it('should return true if purchase order exists', async () => {
      // Arrange
      const purchaseOrderId = 1;
      jest
        .spyOn(prismaService.purchaseOrder, 'findFirst')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      const exists = await repository.existsAsync(purchaseOrderId);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if purchase order does not exist', async () => {
      // Arrange
      const purchaseOrderId = 1;
      jest
        .spyOn(prismaService.purchaseOrder, 'findFirst')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(purchaseOrderId);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('deletePurchaseOrderAsync', () => {
    it('should update an existing purchase order status to deleted', async () => {
      // Arrange
      const purchaseOrderId = 1;

      jest
        .spyOn(prismaService.purchaseOrder, 'update')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      const updatedPurchaseOrder =
        await repository.deletePurchaseOrderAsync(purchaseOrderId);

      // Assert
      expect(updatedPurchaseOrder).toEqual(purchaseOrder);
    });
  });
});
