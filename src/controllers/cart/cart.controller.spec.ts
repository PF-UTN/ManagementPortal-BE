import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productDetailsDtoMock } from '@mp/common/testing';

import { CartController } from './cart.controller';
import { SaveProductRedisCommand } from './command/save-product-redis.command';

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

  describe('SaveProductToRedis', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new SaveProductRedisCommand(
        productDetailsDtoMock.id,
      );

      // Act
      await controller.saveProductToRedis(productDetailsDtoMock.id);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
