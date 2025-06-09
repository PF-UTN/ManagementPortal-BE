import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productCreationDtoMock } from '@mp/common/testing';

import { CreateProductCommand } from './create-product.command';
import { CreateProductCommandHandler } from './create-product.command.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('CreateProductCommandHandler', () => {
  let handler: CreateProductCommandHandler;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductCommandHandler,
        {
          provide: ProductService,
          useValue: mockDeep(ProductService),
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);

    handler = module.get<CreateProductCommandHandler>(
      CreateProductCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createProductAsync with correct parameters', async () => {
    // Arrange
    const command = new CreateProductCommand(productCreationDtoMock);
    const createProductAsyncSpy = jest.spyOn(
      productService,
      'createProductAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(createProductAsyncSpy).toHaveBeenCalledWith(
      command.productCreationDto,
    );
  });
});
