import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  supplierCreationDtoMock,
  supplierWithAddressAndTownMock,
} from '@mp/common/testing';

import { CreateSupplierCommand } from './command/create-supplier.command';
import { SupplierByDocumentQuery } from './query/supplier-by-document.query';
import { SupplierController } from './supplier.controller';

describe('SupplierController', () => {
  let controller: SupplierController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
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

    controller = module.get<SupplierController>(SupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getAllSuppliersAsync', () => {
    it('should call execute on the queryBus', async () => {
      // Act
      await controller.getAllSuppliersAsync();

      // Assert
      expect(queryBus.execute).toHaveBeenCalled();
    });
  });

  describe('createOrUpdateSupplierAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateSupplierCommand(
        supplierCreationDtoMock,
      );

      // Act
      await controller.createOrUpdateSupplierAsync(supplierCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('getSupplierByDocumentAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const documentType = supplierWithAddressAndTownMock.documentType;
      const documentNumber = supplierWithAddressAndTownMock.documentNumber;
      const executeSpy = jest.spyOn(queryBus, 'execute');
      const expectedQuery = new SupplierByDocumentQuery({
        documentType,
        documentNumber,
      });

      // Act
      await controller.getSupplierByDocumentAsync({
        documentType,
        documentNumber,
      });

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });
});
