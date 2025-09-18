import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeliveryMethodId, OrderStatusId } from '@mp/common/constants';
import { OrderCreationDto } from '@mp/common/dtos';

import { CreateOrderCommand } from './command/create-order.command';
import { OrderController } from './order.controller';

describe('OrderController', () => {
  let controller: OrderController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
      ],
    }).compile();

    commandBus = module.get<CommandBus>(CommandBus);

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPurchaseOrderAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const orderCreationDtoMock: OrderCreationDto = {
        clientId: 1,
        orderStatusId: OrderStatusId.Pending,
        paymentDetail: {
          paymentTypeId: 1,
        },
        deliveryMethodId: DeliveryMethodId.HomeDelivery,
        orderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 10.5,
          },
        ],
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateOrderCommand(orderCreationDtoMock);

      // Act
      await controller.createOrderAsync(orderCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
