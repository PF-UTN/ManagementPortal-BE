import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { UpdateEnabledProductCommand } from './update-enabled-product.command';
import { UpdateEnabledProductCommandHandler } from './update-enabled-product.command.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('UpdateEnabledProductCommandHandler', () => {
  let handler: UpdateEnabledProductCommandHandler;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEnabledProductCommandHandler,
        {
          provide: ProductService,
          useValue: mockDeep(ProductService),
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);

    handler = module.get<UpdateEnabledProductCommandHandler>(
      UpdateEnabledProductCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call updateEnabledProductAsync with correct parameters', async () => {
    // Arrange
    const command = new UpdateEnabledProductCommand(1, false);
    const updateEnabledProductAsyncSpy = jest.spyOn(
      productService,
      'updateEnabledProductAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(updateEnabledProductAsyncSpy).toHaveBeenCalledWith(
      command.productId,
      command.enabled,
    );
  });
});
