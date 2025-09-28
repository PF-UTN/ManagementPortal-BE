import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { OrderStatusId } from '@mp/common/constants';
import { UpdateOrderStatusRequestDto } from '@mp/common/dtos';

import { UpdateOrderStatusCommand } from './update-order-status.command';
import { UpdateOrderStatusCommandHandler } from './update-order-status.command.handler';
import { OrderService } from '../../../domain/service/order/order.service';

describe('UpdateOrderStatusCommandHandler', () => {
  let handler: UpdateOrderStatusCommandHandler;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderStatusCommandHandler,
        {
          provide: OrderService,
          useValue: mockDeep<OrderService>(),
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    handler = module.get<UpdateOrderStatusCommandHandler>(
      UpdateOrderStatusCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call updateOrderStatusAsync with correct parameters', async () => {
    // Arrange
    const updateOrderStatusRequestDto: UpdateOrderStatusRequestDto = {
      orderStatusId: OrderStatusId.Pending,
    };
    const command = new UpdateOrderStatusCommand(
      1,
      updateOrderStatusRequestDto,
    );
    const updateOrderStatusAsyncSpy = jest
      .spyOn(orderService, 'updateOrderStatusAsync')
      .mockResolvedValue(void 0);

    // Act
    await handler.execute(command);

    // Assert
    expect(updateOrderStatusAsyncSpy).toHaveBeenCalledWith(
      command.orderId,
      command.orderStatusId,
    );
  });
});
