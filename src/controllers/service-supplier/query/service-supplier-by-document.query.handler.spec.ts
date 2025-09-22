import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { ServiceSupplierByDocumentQuery } from './service-supplier-by-document.query';
import { ServiceSupplierByDocumentQueryHandler } from './service-supplier-by-document.query.handler';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

describe('ServiceSupplierByDocumentQueryHandler', () => {
  let handler: ServiceSupplierByDocumentQueryHandler;
  let serviceSupplierService: ServiceSupplierService;
  let serviceSupplier: ReturnType<
    typeof mockDeep<
      Prisma.ServiceSupplierGetPayload<{
        include: {
          address: {
            include: {
              town: true;
            };
          };
        };
      }>
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceSupplierByDocumentQueryHandler,
        {
          provide: ServiceSupplierService,
          useValue: mockDeep(ServiceSupplierService),
        },
      ],
    }).compile();

    serviceSupplierService = module.get<ServiceSupplierService>(
      ServiceSupplierService,
    );

    handler = module.get<ServiceSupplierByDocumentQueryHandler>(
      ServiceSupplierByDocumentQueryHandler,
    );

    serviceSupplier = mockDeep<
      Prisma.ServiceSupplierGetPayload<{
        include: {
          address: {
            include: {
              town: true;
            };
          };
        };
      }>
    >();

    serviceSupplier.id = 1;
    serviceSupplier.businessName = 'Test Service Supplier';
    serviceSupplier.documentType = 'CUIT';
    serviceSupplier.documentNumber = '12345678901';
    serviceSupplier.email = 'test@example.com';
    serviceSupplier.phone = '1234567890';
    serviceSupplier.addressId = 1;
    serviceSupplier.address = {
      id: 1,
      townId: 1,
      street: 'Test Street',
      streetNumber: 123,
      town: {
        id: 1,
        name: 'Test Town',
        zipCode: 'Test Zip Code',
        provinceId: 1,
      },
    };
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call findByDocumentAsync on the service', async () => {
      // Arrange
      const query = new ServiceSupplierByDocumentQuery({
        documentType: serviceSupplier.documentType,
        documentNumber: serviceSupplier.documentNumber,
      });
      jest
        .spyOn(serviceSupplierService, 'findByDocumentAsync')
        .mockResolvedValueOnce(serviceSupplier);

      const findByDocumentAsyncSpy = jest.spyOn(
        serviceSupplierService,
        'findByDocumentAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findByDocumentAsyncSpy).toHaveBeenCalled();
    });

    it('should return a serviceSupplier when found', async () => {
      // Arrange
      const query = new ServiceSupplierByDocumentQuery({
        documentType: serviceSupplier.documentType,
        documentNumber: serviceSupplier.documentNumber,
      });
      jest
        .spyOn(serviceSupplierService, 'findByDocumentAsync')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(serviceSupplier);
    });
  });
});
