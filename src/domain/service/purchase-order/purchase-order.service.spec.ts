import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Product, PurchaseOrder, Stock } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  OrderDirection,
  PurchaseOrderField,
  PurchaseOrderStatusId,
} from '@mp/common/constants';
import {
  PurchaseOrderCreationDto,
  SearchPurchaseOrderFiltersDto,
  PurchaseOrderDetailsDto,
  PurchaseOrderUpdateDto,
} from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
  StockChangeRepository,
} from '@mp/repository';

import { SearchPurchaseOrderQuery } from './../../../controllers/purchase-order/query/search-purchase-order.query';
import { PurchaseOrderService } from './purchase-order.service';
import { StockService } from '../stock/stock.service';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let purchaseOrderRepository: PurchaseOrderRepository;
  let purchaseOrderItemRepository: PurchaseOrderItemRepository;
  let productRepository: ProductRepository;
  let stockService: StockService;
  let stockChangeRepository: StockChangeRepository;
  let unitOfWork: PrismaUnitOfWork;
  let purchaseOrder: ReturnType<
    typeof mockDeep<
      PurchaseOrder & {
        purchaseOrderItems: { quantity: number; productId: number }[];
      }
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderService,
        {
          provide: PurchaseOrderRepository,
          useValue: mockDeep(PurchaseOrderRepository),
        },
        {
          provide: PurchaseOrderItemRepository,
          useValue: mockDeep(PurchaseOrderItemRepository),
        },
        {
          provide: ProductRepository,
          useValue: mockDeep(ProductRepository),
        },
        {
          provide: StockService,
          useValue: mockDeep(StockService),
        },
        {
          provide: StockChangeRepository,
          useValue: mockDeep(StockChangeRepository),
        },
        {
          provide: ProductRepository,
          useValue: mockDeep(ProductRepository),
        },
        {
          provide: PrismaUnitOfWork,
          useValue: mockDeep(PrismaUnitOfWork),
        },
      ],
    }).compile();

    purchaseOrderRepository = module.get<PurchaseOrderRepository>(
      PurchaseOrderRepository,
    );
    purchaseOrderItemRepository = module.get<PurchaseOrderItemRepository>(
      PurchaseOrderItemRepository,
    );
    productRepository = module.get<ProductRepository>(ProductRepository);
    stockService = module.get<StockService>(StockService);
    stockChangeRepository = module.get<StockChangeRepository>(
      StockChangeRepository,
    );
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<PurchaseOrderService>(PurchaseOrderService);

    purchaseOrder = mockDeep<
      PurchaseOrder & {
        purchaseOrderItems: { quantity: number; productId: number }[];
      }
    >();

    purchaseOrder.id = 1;
    purchaseOrder.supplierId = 1;
    purchaseOrder.estimatedDeliveryDate = mockDeep<Date>();
    purchaseOrder.observation = 'Test observation';
    purchaseOrder.totalAmount = mockDeep<Prisma.Decimal>();
    purchaseOrder.createdAt = mockDeep<Date>();
    purchaseOrder.effectiveDeliveryDate = null;
    purchaseOrder.purchaseOrderStatusId = PurchaseOrderStatusId.Ordered;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPurchaseOrderAsync', () => {
    it('should throw BadRequestException if purchaseOrderItems is empty', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        purchaseOrderItems: [],
      };

      // Act & Assert
      await expect(
        service.createPurchaseOrderAsync(purchaseOrderCreationDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if one or more products do not exist', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        purchaseOrderItems: [{ productId: 999, quantity: 2, unitPrice: 10.0 }],
      };

      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createPurchaseOrderAsync(purchaseOrderCreationDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call unitOfWork.execute with the correct transaction client', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        purchaseOrderItems: [{ productId: 999, quantity: 2, unitPrice: 10.0 }],
      };

      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(true);

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      const purchaseOrderMock = {
        id: 1,
        purchaseOrderStatusId: 4,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(20.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
      };

      jest
        .spyOn(purchaseOrderRepository, 'createPurchaseOrderAsync')
        .mockResolvedValueOnce(purchaseOrderMock);

      // Act
      await service.createPurchaseOrderAsync(purchaseOrderCreationDtoMock);

      // Assert
      expect(unitOfWork.execute).toHaveBeenCalled();
    });

    it('should call purchaseOrderRepository.createPurchaseOrderAsync with the correct data', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        purchaseOrderItems: [{ productId: 1, quantity: 2, unitPrice: 10.0 }],
      };
      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(true);
      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      const purchaseOrderMock = {
        id: 1,
        purchaseOrderStatusId: 4,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(20.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
      };

      jest
        .spyOn(purchaseOrderRepository, 'createPurchaseOrderAsync')
        .mockResolvedValueOnce(purchaseOrderMock);

      // Act
      await service.createPurchaseOrderAsync(purchaseOrderCreationDtoMock);

      // Assert
      expect(
        purchaseOrderRepository.createPurchaseOrderAsync,
      ).toHaveBeenCalledWith(
        {
          supplierId: 1,
          estimatedDeliveryDate: new Date('1990-01-15'),
          observation: 'Test observation',
          totalAmount: 20,
          purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
        },
        txMock,
      );
    });

    it('should call purchaseOrderItemRepository.createManyPurchaseOrderItemAsync with the correct data', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        purchaseOrderItems: [{ productId: 1, quantity: 2, unitPrice: 10.0 }],
      };

      jest
        .spyOn(productRepository, 'existsManyAsync')
        .mockResolvedValueOnce(true);

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest
        .spyOn(purchaseOrderRepository, 'createPurchaseOrderAsync')
        .mockResolvedValueOnce({
          id: 1,
          purchaseOrderStatusId: 4,
          supplierId: 1,
          estimatedDeliveryDate: new Date('1990-01-15'),
          observation: 'Test observation',
          totalAmount: new Prisma.Decimal(20.0),
          createdAt: new Date(),
          effectiveDeliveryDate: null,
        });

      // Act
      await service.createPurchaseOrderAsync(purchaseOrderCreationDtoMock);

      // Assert
      expect(
        purchaseOrderItemRepository.createManyPurchaseOrderItemAsync,
      ).toHaveBeenCalledWith(
        [
          {
            productId: 1,
            quantity: 2,
            unitPrice: 10.0,
            subtotalPrice: 20.0,
            purchaseOrderId: 1,
          },
        ],
        txMock,
      );
    });
  });

  describe('findPurchaseOrderByIdAsync', () => {
    it('should throw NotFoundException if purchase order does not exist', async () => {
      // Arrange
      const id = 999;
      jest
        .spyOn(purchaseOrderRepository, 'findByIdWithSupplierAndStatusAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findPurchaseOrderByIdAsync(id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return purchase order details with items', async () => {
      // Arrange
      const purchaseOrderItemsMock = [
        {
          id: 1,
          purchaseOrderId: 1,
          productId: 1,
          product: {
            id: 1,
            name: 'Test Product',
            supplierId: 1,
            description: 'Test product description',
            price: new Prisma.Decimal(10.0),
            enabled: true,
            weight: new Prisma.Decimal(1.0),
            categoryId: 1,
            deletedAt: null,
          },
          quantity: 10,
          unitPrice: new Prisma.Decimal(10.0),
          subtotalPrice: new Prisma.Decimal(100.0),
        },
      ];

      const purchaseOrderMock = {
        id: 1,
        createdAt: new Date(),
        estimatedDeliveryDate: new Date('1990-01-15'),
        effectiveDeliveryDate: null,
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(100.0),
        purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
        purchaseOrderStatus: {
          id: PurchaseOrderStatusId.Ordered,
          name: 'Ordered',
        },
        supplierId: 1,
        supplier: {
          id: 1,
          businessName: 'Test Supplier',
          documentType: 'CUIT',
          documentNumber: '201234567890',
          email: 'test@supplier.com',
          phone: '1234567890',
          addressId: 1,
        },
        purchaseOrderItems: purchaseOrderItemsMock.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          subtotalPrice: Number(item.unitPrice) * item.quantity,
        })),
      };

      const purchaseOrderDetailsDtoMock: PurchaseOrderDetailsDto = {
        id: 1,
        createdAt: purchaseOrderMock.createdAt,
        estimatedDeliveryDate: purchaseOrderMock.estimatedDeliveryDate,
        effectiveDeliveryDate: purchaseOrderMock.effectiveDeliveryDate,
        observation: purchaseOrderMock.observation,
        totalAmount: purchaseOrderMock.totalAmount.toNumber(),
        status: {
          id: PurchaseOrderStatusId.Ordered,
          name: 'Ordered',
        },
        supplier: purchaseOrderMock.supplier.businessName,
        purchaseOrderItems: purchaseOrderMock.purchaseOrderItems,
      };

      jest
        .spyOn(purchaseOrderItemRepository, 'findByPurchaseOrderIdAsync')
        .mockResolvedValueOnce(purchaseOrderItemsMock);

      jest
        .spyOn(purchaseOrderRepository, 'findByIdWithSupplierAndStatusAsync')
        .mockResolvedValueOnce(purchaseOrderMock);

      const purchaseOrderDetailsDtoMockWithTranslations: PurchaseOrderDetailsDto =
        {
          ...purchaseOrderDetailsDtoMock,
          status: {
            id: PurchaseOrderStatusId.Ordered,
            name: 'Pedida',
          },
        };

      // Act
      const result = await service.findPurchaseOrderByIdAsync(1);

      // Assert
      expect(result).toEqual(purchaseOrderDetailsDtoMockWithTranslations);
    });
  });

  describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchPurchaseOrderFiltersDto = {
        statusName: ['Ordered'],
        supplierBusinessName: ['Supplier A'],
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        fromEstimatedDeliveryDate: '2025-01-15',
        toEstimatedDeliveryDate: '2025-01-20',
      };
      const orderBy = {
        field: PurchaseOrderField.CREATED_AT,
        direction: OrderDirection.ASC,
      };
      const page = 1;
      const pageSize = 10;
      const query = new SearchPurchaseOrderQuery({
        searchText,
        filters,
        page,
        pageSize,
        orderBy,
      });

      // Act
      await service.searchWithFiltersAsync(query);

      // Assert
      expect(
        purchaseOrderRepository.searchWithFiltersAsync,
      ).toHaveBeenCalledWith(
        query.page,
        query.pageSize,
        query.searchText,
        query.filters,
        query.orderBy,
      );
    });
  });

  describe('deletePurchaseOrderAsync', () => {
    it('should throw NotFoundException if purchase order does not exist', async () => {
      // Arrange
      const id = 999;
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.deletePurchaseOrderAsync(id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if purchase order is in Ordered status', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderMock: PurchaseOrder & {
        purchaseOrderItems: { quantity: number; productId: number }[];
      } = {
        id,
        purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(100.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
        purchaseOrderItems: [],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrderMock);
      jest
        .spyOn(purchaseOrderRepository, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(purchaseOrderRepository, 'deletePurchaseOrderAsync')
        .mockResolvedValueOnce(purchaseOrderMock);
      // Act & Assert
      await expect(service.deletePurchaseOrderAsync(id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if purchase order is in Received status', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderMock: PurchaseOrder & {
        purchaseOrderItems: { quantity: number; productId: number }[];
      } = {
        id,
        purchaseOrderStatusId: PurchaseOrderStatusId.Received,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(100.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
        purchaseOrderItems: [],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrderMock);
      jest
        .spyOn(purchaseOrderRepository, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(purchaseOrderRepository, 'deletePurchaseOrderAsync')
        .mockResolvedValueOnce(purchaseOrderMock);
      // Act & Assert
      await expect(service.deletePurchaseOrderAsync(id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call purchaseOrderRepository.deletePurchaseOrderAsync with the correct id', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderMock: PurchaseOrder & {
        purchaseOrderItems: { quantity: number; productId: number }[];
      } = {
        id,
        purchaseOrderStatusId: PurchaseOrderStatusId.Draft,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(100.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
        purchaseOrderItems: [],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrderMock);
      jest
        .spyOn(purchaseOrderRepository, 'deletePurchaseOrderAsync')
        .mockResolvedValueOnce({} as PurchaseOrder);

      // Act
      await service.deletePurchaseOrderAsync(id);

      // Assert
      expect(
        purchaseOrderRepository.deletePurchaseOrderAsync,
      ).toHaveBeenCalledWith(id);
    });
  });

  describe('updatePurchaseOrderStatusAsync', () => {
    const mockPurchaseOrder: PurchaseOrder & {
      purchaseOrderItems: { quantity: number; productId: number }[];
    } = {
      id: 1,
      purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
      purchaseOrderItems: [{ productId: 101, quantity: 5 }],
      observation: 'Initial observation',
      effectiveDeliveryDate: null,
      supplierId: 1,
      estimatedDeliveryDate: new Date('2023-10-01'),
      createdAt: new Date('2023-09-01'),
      totalAmount: new Prisma.Decimal(100.0),
    };

    beforeEach(() => {
      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockImplementation(async (productId: number) => ({
          id: 1,
          productId,
          quantityAvailable: 10,
          quantityOrdered: 100,
          quantityReserved: 1000,
        }));
    });

    it('should throw NotFoundException if purchase order does not exist', async () => {
      // Arrange
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValue(null);

      // Act
      const act = service.updatePurchaseOrderStatusAsync(
        999,
        PurchaseOrderStatusId.Cancelled,
        'Cancelled reason',
      );

      // Assert
      await expect(act).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      // Arrange
      jest.spyOn(purchaseOrderRepository, 'findByIdAsync').mockResolvedValue({
        ...mockPurchaseOrder,
        purchaseOrderStatusId: PurchaseOrderStatusId.Received,
      });

      // Act
      const act = service.updatePurchaseOrderStatusAsync(
        1,
        PurchaseOrderStatusId.Draft,
      );

      // Assert
      await expect(act).rejects.toThrow(BadRequestException);
    });

    it('should require observation when cancelling', async () => {
      // Arrange
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValue(mockPurchaseOrder);

      // Act
      const act = service.updatePurchaseOrderStatusAsync(
        1,
        PurchaseOrderStatusId.Cancelled,
      );

      // Assert
      await expect(act).rejects.toThrow(
        'Observation is required when cancelling a purchase order.',
      );
    });

    it('should require effectiveDeliveryDate when receiving', async () => {
      // Arrange
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValue(mockPurchaseOrder);

      // Act
      const act = service.updatePurchaseOrderStatusAsync(
        1,
        PurchaseOrderStatusId.Received,
      );

      // Assert
      await expect(act).rejects.toThrow(
        'Effective delivery date is required when receiving a purchase order.',
      );
    });

    it('should successfully cancel a purchase order with observation', async () => {
      // Arrange
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValue(mockPurchaseOrder);
      jest
        .spyOn(purchaseOrderRepository, 'updatePurchaseOrderAsync')
        .mockResolvedValue({
          ...mockPurchaseOrder,
          purchaseOrderStatusId: PurchaseOrderStatusId.Cancelled,
          observation: 'Cancelled reason',
        });

      // Act
      const result = await service.updatePurchaseOrderStatusAsync(
        1,
        PurchaseOrderStatusId.Cancelled,
        'Cancelled reason',
      );

      // Assert
      await expect(result.purchaseOrderStatusId).toBe(
        PurchaseOrderStatusId.Cancelled,
      );
    });

    it('should successfully mark a purchase order as received', async () => {
      // Arrange
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValue(mockPurchaseOrder);
      const deliveryDate = new Date();
      jest
        .spyOn(purchaseOrderRepository, 'updatePurchaseOrderAsync')
        .mockResolvedValue({
          ...mockPurchaseOrder,
          purchaseOrderStatusId: PurchaseOrderStatusId.Received,
          effectiveDeliveryDate: deliveryDate,
        });

      // Act
      const result = await service.updatePurchaseOrderStatusAsync(
        1,
        PurchaseOrderStatusId.Received,
        'Received successfully',
        deliveryDate,
      );

      // Assert
      await expect(result.purchaseOrderStatusId).toBe(
        PurchaseOrderStatusId.Received,
      );
    });
  });

  describe('updatePurchaseOrderAsync', () => {
    it('should throw NotFoundException if purchase order does not exists', async () => {
      // Arrange
      const id = 999;
      const purchaseOrderUpdateDto: PurchaseOrderUpdateDto = {
        purchaseOrderStatusId: PurchaseOrderStatusId.Draft,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        effectiveDeliveryDate: null,
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 10.0,
          },
        ],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(null);

      // Act
      await expect(
        service.updatePurchaseOrderAsync(id, purchaseOrderUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if purchase order does not have items', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderUpdateDto: PurchaseOrderUpdateDto = {
        purchaseOrderStatusId: PurchaseOrderStatusId.Draft,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        effectiveDeliveryDate: null,
        purchaseOrderItems: [],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      await expect(
        service.updatePurchaseOrderAsync(id, purchaseOrderUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if status transation is invalid', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderUpdateDto: PurchaseOrderUpdateDto = {
        purchaseOrderStatusId: PurchaseOrderStatusId.Deleted,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        effectiveDeliveryDate: null,
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 10.0,
          },
        ],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      await expect(
        service.updatePurchaseOrderAsync(id, purchaseOrderUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new status is Cancelled and observation is empty', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderUpdateDto: PurchaseOrderUpdateDto = {
        purchaseOrderStatusId: PurchaseOrderStatusId.Cancelled,
        estimatedDeliveryDate: new Date('1990-01-15'),
        effectiveDeliveryDate: null,
        observation: '',
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 10.0,
          },
        ],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      await expect(
        service.updatePurchaseOrderAsync(id, purchaseOrderUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new status is Received and effective delivery date is null', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderUpdateDto: PurchaseOrderUpdateDto = {
        purchaseOrderStatusId: PurchaseOrderStatusId.Received,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        effectiveDeliveryDate: null,
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 10.0,
          },
        ],
      };
      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrder);

      // Act
      await expect(
        service.updatePurchaseOrderAsync(id, purchaseOrderUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call unitOfWork.execute with the correct transaction client', async () => {
      const id = 1;
      const purchaseOrderUpdateDto: PurchaseOrderUpdateDto = {
        purchaseOrderStatusId: PurchaseOrderStatusId.Received,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        effectiveDeliveryDate: new Date('1990-01-20'),
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 10.0,
          },
        ],
      };

      const currentPurchaseOrderItems = [
        {
          id: 1,
          productId: 1,
          quantity: 5,
          unitPrice: new Prisma.Decimal(10.0),
          subtotalPrice: new Prisma.Decimal(50.0),
          purchaseOrderId: 1,
          product: mockDeep<Product>(),
        },
        {
          id: 2,
          productId: 2,
          quantity: 2,
          unitPrice: new Prisma.Decimal(5.0),
          subtotalPrice: new Prisma.Decimal(10.0),
          purchaseOrderId: 1,
          product: mockDeep<Product>(),
        },
      ];

      jest
        .spyOn(purchaseOrderRepository, 'findByIdAsync')
        .mockResolvedValueOnce(purchaseOrder);

      jest
        .spyOn(purchaseOrderItemRepository, 'findByPurchaseOrderIdAsync')
        .mockResolvedValueOnce(currentPurchaseOrderItems);

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest
        .spyOn(stockService, 'findByProductIdAsync')
        .mockResolvedValueOnce(mockDeep<Stock>());

      jest
        .spyOn(stockChangeRepository, 'createManyStockChangeAsync')
        .mockResolvedValueOnce(mockDeep<Promise<void>>());

      // Act
      await service.updatePurchaseOrderAsync(id, purchaseOrderUpdateDto);

      // Assert
      expect(unitOfWork.execute).toHaveBeenCalled();
    });
  });
});
