import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSupplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { GetServiceSupplierByIdQuery } from './get-service-supplier-by-id.query';
import { GetServiceSupplierByIdQueryHandler } from './get-service-supplier-by-id.query.handler';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

describe('GetServiceSupplierByIdQueryHandler', () => {
  let handler: GetServiceSupplierByIdQueryHandler;
  let serviceSupplierService: ServiceSupplierService;
  let serviceSupplier: ReturnType<typeof mockDeep<ServiceSupplier>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetServiceSupplierByIdQueryHandler,
        {
          provide: ServiceSupplierService,
          useValue: mockDeep(ServiceSupplierService),
        },
      ],
    }).compile();

    serviceSupplierService = module.get<ServiceSupplierService>(
      ServiceSupplierService,
    );

    handler = module.get<GetServiceSupplierByIdQueryHandler>(
      GetServiceSupplierByIdQueryHandler,
    );

    serviceSupplier = mockDeep<ServiceSupplier>();

    serviceSupplier.id = 1;
    serviceSupplier.businessName = 'Test Service Supplier';
    serviceSupplier.documentType = 'CUIT';
    serviceSupplier.documentNumber = '1234567890';
    serviceSupplier.email = 'test@service-supplier.com';
    serviceSupplier.phone = '1234567890';
    serviceSupplier.addressId = 1;
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call findByIdAsync on the service', async () => {
      // Arrange
      const query = new GetServiceSupplierByIdQuery(1);
      jest
        .spyOn(serviceSupplierService, 'findByIdAsync')
        .mockResolvedValueOnce(serviceSupplier);

      const findByIdAsyncSpy = jest.spyOn(
        serviceSupplierService,
        'findByIdAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findByIdAsyncSpy).toHaveBeenCalled();
    });
  });
});
