import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { CreateProductCategoryCommand } from './create-product-category.command';
import { CreateProductCategoryCommandHandler } from './create-product-category.command.handler';
import { ProductCategoryService } from '../../../domain/service/product-category/product-category.service';

describe('CreateProductCommandHandler', () => {
  let handler: CreateProductCategoryCommandHandler;
  let productCategoryService: ProductCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductCategoryCommandHandler,
        {
          provide: ProductCategoryService,
          useValue: mockDeep(ProductCategoryService),
        },
      ],
    }).compile();

    productCategoryService = module.get<ProductCategoryService>(
      ProductCategoryService,
    );

    handler = module.get<CreateProductCategoryCommandHandler>(
      CreateProductCategoryCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createOrUpdateProductCategoryAsync with correct parameters', async () => {
    // Arrange
    const productCategoryCreationDtoMock = {
      id: 1,
      name: 'Test Category',
      description: 'Test Description',
    };
    const command = new CreateProductCategoryCommand(
      productCategoryCreationDtoMock,
    );
    const createOrUpdateProductCategoryAsyncSpy = jest.spyOn(
      productCategoryService,
      'createOrUpdateProductCategoryAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(createOrUpdateProductCategoryAsyncSpy).toHaveBeenCalledWith(
      command.productCategoryCreationDto,
    );
  });
});
