import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchProductRequest } from '@mp/common/dtos';
import {
  productCreationDtoMock,
  productUpdateDtoMock,
} from '@mp/common/testing';

import { CreateProductCommand } from './command/create-product.command';
import { SearchProductQuery } from './command/search-product-query';
import { UpdateEnabledProductCommand } from './command/update-enabled-product.command';
import { UpdateProductCommand } from './command/update-product.command';
import { ProductController } from './product.controller';

describe('ProductController', () => {
  let controller: ProductController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep<QueryBus>(),
        },
        {
          provide: CommandBus,
          useValue: mockDeep<CommandBus>(),
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('searchAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const request: SearchProductRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          categoryName: ['Electronics'],
          supplierBusinessName: ['Supplier A'],
          enabled: true,
        },
      };

      await controller.searchAsync(request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchProductQuery(request),
      );
    });
  });

  describe('createProductAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateProductCommand(productCreationDtoMock);

      // Act
      await controller.createProductAsync(productCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updateProductAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdateProductCommand(1, productUpdateDtoMock);

      // Act
      await controller.updateProductAsync(1, productUpdateDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updateEnabledProductAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const enabled = false;
      const expectedCommand = new UpdateEnabledProductCommand(1, enabled);

      // Act
      await controller.updateEnabledProductAsync(1, { enabled });

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
