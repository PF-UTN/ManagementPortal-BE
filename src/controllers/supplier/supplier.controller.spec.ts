import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { supplierCreationDtoMock } from '@mp/common/testing';

import { CreateSupplierCommand } from './command/create-supplier.command';
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
});
