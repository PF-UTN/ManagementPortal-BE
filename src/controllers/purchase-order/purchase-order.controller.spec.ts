import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderCreationDto } from '@mp/common/dtos';

import { CreatePurchaseOrderCommand } from './command/create-purchase-order.command';
import { PurchaseOrderController } from './purchase-order.controller';

describe('PurchaseOrderController', () => {
  let controller: PurchaseOrderController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
      ],
    }).compile();

    commandBus = module.get<CommandBus>(CommandBus);

    controller = module.get<PurchaseOrderController>(PurchaseOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPurchaseOrderAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Purchase order for office supplies',
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 100,
          },
        ],
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreatePurchaseOrderCommand(
        purchaseOrderCreationDtoMock,
      );

      // Act
      await controller.createPurchaseOrderAsync(purchaseOrderCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
