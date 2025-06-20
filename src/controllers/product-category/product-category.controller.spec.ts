import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { CreateProductCategoryCommand } from './command/create-product-category.command';
import { ProductCategoryController } from './product-category.controller';
import { ProductCategoriesQuery } from './query/product-categories.query';

describe('ProductCategoryController', () => {
  let controller: ProductCategoryController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCategoryController],
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

    controller = module.get<ProductCategoryController>(
      ProductCategoryController,
    );
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getProductCategoriesAsync', () => {
    it('should call execute on the queryBus', async () => {
      // Act
      const query = new ProductCategoriesQuery();
      await controller.getProductCategoriesAsync();
      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(query);
    });
  });

  describe('createOrUpdateProductCategoryAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const productCategoryCreationDtoMock = {
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
      };
      const expectedCommand = new CreateProductCategoryCommand(
        productCategoryCreationDtoMock,
      );

      // Act
      await controller.createOrUpdateProductCategoryAsync(
        productCategoryCreationDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
