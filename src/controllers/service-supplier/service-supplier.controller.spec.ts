import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSupplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  AddressCreationDto,
  SearchServiceSupplierRequest,
  ServiceSupplierCreationDto,
} from '@mp/common/dtos';

import { CreateServiceSupplierCommand } from './command/create-service-supplier.command';
import { GetServiceSupplierByIdQuery } from './query/get-service-supplier-by-id.query';
import { SearchServiceSupplierQuery } from './query/search-service-supplier.query';
import { ServiceSupplierController } from './service-supplier.controller';

describe('ServiceSupplierController', () => {
  let controller: ServiceSupplierController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;
  let serviceSupplier: ReturnType<typeof mockDeep<ServiceSupplier>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceSupplierController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
      ],
    }).compile();

    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);

    controller = module.get<ServiceSupplierController>(
      ServiceSupplierController,
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
    expect(controller).toBeDefined();
  });
  describe('getServiceSupplierByIdAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const serviceSupplierId = 1;
      const expectedQuery = new GetServiceSupplierByIdQuery(serviceSupplierId);

      // Act
      await controller.getServiceSupplierByIdAsync(serviceSupplierId);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('createOrUpdateServiceSupplierAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const serviceSupplierCreationDtoMock: ServiceSupplierCreationDto = {
        businessName: serviceSupplier.businessName,
        documentType: serviceSupplier.documentType,
        documentNumber: serviceSupplier.documentNumber,
        email: serviceSupplier.email,
        phone: serviceSupplier.phone,
        address: mockDeep<AddressCreationDto>(),
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateServiceSupplierCommand(
        serviceSupplierCreationDtoMock,
      );

      // Act
      await controller.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('searchServiceSupplierAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const request: SearchServiceSupplierRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      };

      await controller.searchServiceSupplierAsync(request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchServiceSupplierQuery(request),
      );
    });
  });
});
