import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productUpdateDtoMock } from '@mp/common/testing';

import { UpdateProductCommand } from './update-product.command';
import { UpdateProductCommandHandler } from './update-product.command.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('UpdateProductCommandHandler', () => {
  let handler: UpdateProductCommandHandler;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductCommandHandler,
        {
          provide: ProductService,
          useValue: mockDeep(ProductService),
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);

    handler = module.get<UpdateProductCommandHandler>(
      UpdateProductCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call updateProductAsync with correct parameters', async () => {
    // Arrange
    const command = new UpdateProductCommand(1, productUpdateDtoMock);
    const updateProductAsyncSpy = jest.spyOn(
      productService,
      'updateProductAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(updateProductAsyncSpy).toHaveBeenCalledWith(
      command.productId,
      command.productUpdateDto,
    );
  });
});
