import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderStatusId } from '@mp/common/constants';
import { PurchaseOrderCreationDto } from '@mp/common/dtos';
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
});
