import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeleteProductFromCartDto } from '@mp/common/dtos';
import { UpdateCartProductQuantityDto } from '@mp/common/dtos';

import { CartController } from './cart.controller';
import { DeleteProductCartCommand } from './command/delete-product-cart.command';
import { EmptyCartCommand } from './command/empty-cart.command';
import { UpdateCartProductQuantityCommand } from './command/update-product-quantity-in-cart.command';

describe('CartController', () => {
  let controller: CartController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockDeep<CommandBus>(),
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCartProductQuantityAsync', () => {
    const cartId = 1;
    const dto: UpdateCartProductQuantityDto = { productId: 100, quantity: 3 };
    const resultMock = { success: true };

    it('should call commandBus.execute with UpdateCartProductQuantityCommand', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.updateCartProductQuantityAsync(cartId, dto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateCartProductQuantityCommand(cartId, dto),
      );
    });

    it('should return the result from commandBus.execute', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result = await controller.updateCartProductQuantityAsync(
        cartId,
        dto,
      );

      // Assert
      expect(result).toEqual(resultMock);
    });
  });
  describe('deleteProductFromCartAsync', () => {
    const cartId = 1;
    const dto: DeleteProductFromCartDto = { productId: 100 };
    const resultMock = { success: true };

    it('should call commandBus.execute with DeleteProductCartCommand', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.deleteProductFromCartAsync(cartId, dto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteProductCartCommand(cartId, dto),
      );
    });

    it('should return the result from commandBus.execute', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result = await controller.deleteProductFromCartAsync(cartId, dto);

      // Assert
      expect(result).toEqual(resultMock);
    });
  });
  describe('emptyCartAsync', () => {
    const cartId = 1;
    const resultMock = { success: true };

    it('should call commandBus.execute with EmptyCartCommand', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.emptyCartAsync(cartId);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        new EmptyCartCommand(cartId),
      );
    });

    it('should return the result from commandBus.execute', async () => {
      // Arrange
      jest.spyOn(commandBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result = await controller.emptyCartAsync(cartId);

      // Assert
      expect(result).toEqual(resultMock);
    });
  });
});
