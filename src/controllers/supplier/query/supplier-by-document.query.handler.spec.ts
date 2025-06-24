import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { supplierWithAddressAndTownMock } from '@mp/common/testing';

import { SupplierByDocumentQuery } from './supplier-by-document.query';
import { SupplierByDocumentQueryHandler } from './supplier-by-document.query.handler';
import { SupplierService } from '../../../domain/service/supplier/supplier.service';

describe('SupplierByDocumentQueryHandler', () => {
  let handler: SupplierByDocumentQueryHandler;
  let supplierService: SupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierByDocumentQueryHandler,
        {
          provide: SupplierService,
          useValue: mockDeep(SupplierService),
        },
      ],
    }).compile();

    supplierService = module.get<SupplierService>(SupplierService);

    handler = module.get<SupplierByDocumentQueryHandler>(
      SupplierByDocumentQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call findByDocumentAsync on the service', async () => {
      // Arrange
      const query = new SupplierByDocumentQuery({
        documentType: supplierWithAddressAndTownMock.documentType,
        documentNumber: supplierWithAddressAndTownMock.documentNumber,
      });
      jest
        .spyOn(supplierService, 'findByDocumentAsync')
        .mockResolvedValueOnce(supplierWithAddressAndTownMock);

      const findByDocumentAsyncSpy = jest.spyOn(
        supplierService,
        'findByDocumentAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findByDocumentAsyncSpy).toHaveBeenCalled();
    });

    it('should return a supplier when found', async () => {
      // Arrange
      const query = new SupplierByDocumentQuery({
        documentType: supplierWithAddressAndTownMock.documentType,
        documentNumber: supplierWithAddressAndTownMock.documentNumber,
      });
      jest
        .spyOn(supplierService, 'findByDocumentAsync')
        .mockResolvedValueOnce(supplierWithAddressAndTownMock);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(supplierWithAddressAndTownMock);
    });
  });
});
