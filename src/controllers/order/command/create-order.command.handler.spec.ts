import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { orderBasicDtoMock, orderCreationDtoMock } from '@mp/common/testing';

import { OrderService } from './../../../domain/service/order/order.service';
import { CreateOrderCommand } from './create-order.command';
import { CreateOrderCommandHandler } from './create-order.command.handler';

describe('CreateOrderCommandHandler', () => {
  let handler: CreateOrderCommandHandler;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderCommandHandler,
        {
          provide: OrderService,
          useValue: mockDeep(OrderService),
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);

    handler = module.get<CreateOrderCommandHandler>(CreateOrderCommandHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createOrderAsync with correct parameters', async () => {
    // Arrange
    const command = new CreateOrderCommand(orderCreationDtoMock);
    const createOrderAsyncSpy = jest.spyOn(orderService, 'createOrderAsync');

    // Act
    await handler.execute(command);

    // Assert
    expect(createOrderAsyncSpy).toHaveBeenCalledWith(command.orderCreationDto);
  });
  it('should call createOrderAsync with correct parameters and return the result', async () => {
    // Arrange
    const command = new CreateOrderCommand(orderCreationDtoMock);

    jest
      .spyOn(orderService, 'createOrderAsync')
      .mockResolvedValueOnce(orderBasicDtoMock);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(orderService.createOrderAsync).toHaveBeenCalledWith(
      command.orderCreationDto,
    );
    expect(result).toEqual(orderBasicDtoMock);
  });
});
