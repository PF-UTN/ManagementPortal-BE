import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PurchaseOrder } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderStatusId } from '@mp/common/constants';
import {
  PurchaseOrderCreationDto,
  PurchaseOrderDetailsDto,
} from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
} from '@mp/repository';

import { PurchaseOrderService } from './purchase-order.service';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let purchaseOrderRepository: PurchaseOrderRepository;
  let purchaseOrderItemRepository: PurchaseOrderItemRepository;
  let productRepository: ProductRepository;
  let unitOfWork: PrismaUnitOfWork;

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
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<PurchaseOrderService>(PurchaseOrderService);
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
            name: 'Ordenada',
          },
        };

      // Act
      const result = await service.findPurchaseOrderByIdAsync(1);

      // Assert
      expect(result).toEqual(purchaseOrderDetailsDtoMockWithTranslations);
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
      const purchaseOrderMock: PurchaseOrder = {
        id,
        purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(100.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
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
      const purchaseOrderMock: PurchaseOrder = {
        id,
        purchaseOrderStatusId: PurchaseOrderStatusId.Received,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(100.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
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
      const purchaseOrderMock: PurchaseOrder = {
        id,
        purchaseOrderStatusId: PurchaseOrderStatusId.Draft,
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Test observation',
        totalAmount: new Prisma.Decimal(100.0),
        createdAt: new Date(),
        effectiveDeliveryDate: null,
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
});
