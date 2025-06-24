import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeleteProductCommand } from './delete-product.command';
import { DeleteProductCommandHandler } from './delete-product.command.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('DeleteProductCommandHandler', () => {
  let handler: DeleteProductCommandHandler;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductCommandHandler,
        {
          provide: ProductService,
          useValue: mockDeep(ProductService),
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);

    handler = module.get<DeleteProductCommandHandler>(
      DeleteProductCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call deleteProductAsync with correct parameters', async () => {
    // Arrange
    const command = new DeleteProductCommand(1);
    const deleteProductAsyncSpy = jest.spyOn(
      productService,
      'deleteProductAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(deleteProductAsyncSpy).toHaveBeenCalledWith(
      command.productId,
    );
  });
});
