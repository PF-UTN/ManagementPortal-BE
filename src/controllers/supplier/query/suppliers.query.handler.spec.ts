import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { suppliersMock } from '@mp/common/testing';

import { SuppliersQueryHandler } from './suppliers.query.handler';
import { SupplierService } from '../../../domain/service/supplier/supplier.service';

describe('SuppliersQueryHandler', () => {
  let handler: SuppliersQueryHandler;
  let supplierService: SupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersQueryHandler,
        {
          provide: SupplierService,
          useValue: mockDeep(SupplierService),
        },
      ],
    }).compile();

    supplierService = module.get<SupplierService>(SupplierService);

    handler = module.get<SuppliersQueryHandler>(
      SuppliersQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call getAllSuppliersAsync on the service', async () => {
      // Arrange
      jest
        .spyOn(supplierService, 'getAllSuppliersAsync')
        .mockResolvedValueOnce(suppliersMock);

      const getAllSuppliersAsyncSpy = jest.spyOn(
        supplierService,
        'getAllSuppliersAsync',
      );

      // Act
      await handler.execute();

      // Assert
      expect(getAllSuppliersAsyncSpy).toHaveBeenCalled();
    });

    it('should return an array of suppliers', async () => {
      // Arrange
      jest
        .spyOn(supplierService, 'getAllSuppliersAsync')
        .mockResolvedValueOnce(suppliersMock);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual(suppliersMock);
    });

    it('should throw NotFoundException if no suppliers are found', async () => {
      // Arrange
      jest
        .spyOn(supplierService, 'getAllSuppliersAsync')
        .mockResolvedValueOnce([]);
      // Act & Assert
      await expect(handler.execute()).rejects.toThrow(NotFoundException);
    });
  });
});
