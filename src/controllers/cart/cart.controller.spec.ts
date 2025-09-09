import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeleteProductFromCartDto } from '@mp/common/dtos';
import { UpdateCartProductQuantityDto } from '@mp/common/dtos';

import { CartController } from './cart.controller';
import { DeleteProductCartCommand } from './command/delete-product-cart.command';
import { EmptyCartCommand } from './command/empty-cart.command';
import { UpdateCartProductQuantityCommand } from './command/update-product-quantity-in-cart.command';
import { GetCartByIdQuery } from './query/get-cart-by-id.query';

describe('CartController', () => {
  let controller: CartController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockDeep<CommandBus>(),
        },
        {
          provide: QueryBus,
          useValue: mockDeep<QueryBus>(),
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCartProductQuantityAsync', () => {
    const authorizationHeader = 'Bearer fake-token';
    const dto: UpdateCartProductQuantityDto = { productId: 100, quantity: 3 };
    const resultMock = { success: true };

    it('should call commandBus.execute with UpdateCartProductQuantityCommand', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.updateCartProductQuantityAsync(authorizationHeader, dto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateCartProductQuantityCommand(authorizationHeader, dto),
      );
    });

    it('should return the result from commandBus.execute', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result = await controller.updateCartProductQuantityAsync(
        authorizationHeader,
        dto,
      );

      // Assert
      expect(result).toEqual(resultMock);
    });
  });

  describe('deleteProductFromCartAsync', () => {
    const authorizationHeader = 'Bearer fake-token';
    const dto: DeleteProductFromCartDto = { productId: 100 };
    const resultMock = { success: true };

    it('should call commandBus.execute with DeleteProductCartCommand', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.deleteProductFromCartAsync(authorizationHeader, dto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteProductCartCommand(authorizationHeader, dto),
      );
    });

    it('should return the result from commandBus.execute', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result = await controller.deleteProductFromCartAsync(
        authorizationHeader,
        dto,
      );

      // Assert
      expect(result).toEqual(resultMock);
    });
  });

  describe('emptyCartAsync', () => {
    const authorizationHeader = 'Bearer fake-token';
    const resultMock = { success: true };

    it('should call commandBus.execute with EmptyCartCommand', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.emptyCartAsync(authorizationHeader);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        new EmptyCartCommand(authorizationHeader),
      );
    });

    it('should return the result from commandBus.execute', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result = await controller.emptyCartAsync(authorizationHeader);

      // Assert
      expect(result).toEqual(resultMock);
    });
  });

  describe('getCartByIdAsync', () => {
    const authorizationHeader = 'Bearer fake-token';
    const resultMock = { cartId: '1', items: [] };

    it('should call queryBus.execute with GetCartByIdQuery', async () => {
      // Arrange
      jest.spyOn(queryBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.getCartByIdAsync(authorizationHeader);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetCartByIdQuery(authorizationHeader),
      );
    });

    it('should return the result from queryBus.execute', async () => {
      // Arrange
      jest.spyOn(queryBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result = await controller.getCartByIdAsync(authorizationHeader);

      // Assert
      expect(result).toEqual(resultMock);
    });
  });
});
