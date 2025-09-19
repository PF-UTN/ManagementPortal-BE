import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSupplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  AddressCreationDto,
  ServiceSupplierCreationDto,
} from '@mp/common/dtos';

import { CreateServiceSupplierCommand } from './create-service-supplier.command';
import { CreateServiceSupplierCommandHandler } from './create-service-supplier.command.handler';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

describe('CreateProductCommandHandler', () => {
  let handler: CreateServiceSupplierCommandHandler;
  let serviceSupplierService: ServiceSupplierService;
  let serviceSupplier: ReturnType<typeof mockDeep<ServiceSupplier>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateServiceSupplierCommandHandler,
        {
          provide: ServiceSupplierService,
          useValue: mockDeep(ServiceSupplierService),
        },
      ],
    }).compile();

    serviceSupplierService = module.get<ServiceSupplierService>(
      ServiceSupplierService,
    );

    handler = module.get<CreateServiceSupplierCommandHandler>(
      CreateServiceSupplierCommandHandler,
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

  it('should call createOrUpdateServiceSupplierAsync with correct parameters', async () => {
    // Arrange
    const serviceSupplierCreationDtoMock: ServiceSupplierCreationDto = {
      businessName: serviceSupplier.businessName,
      documentType: serviceSupplier.documentType,
      documentNumber: serviceSupplier.documentNumber,
      email: serviceSupplier.email,
      phone: serviceSupplier.phone,
      address: mockDeep<AddressCreationDto>(),
    };
    const command = new CreateServiceSupplierCommand(
      serviceSupplierCreationDtoMock,
    );
    const createOrUpdateServiceSupplierAsyncSpy = jest.spyOn(
      serviceSupplierService,
      'createOrUpdateServiceSupplierAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(createOrUpdateServiceSupplierAsyncSpy).toHaveBeenCalledWith(
      command.serviceSupplierCreationDto,
    );
  });
});
