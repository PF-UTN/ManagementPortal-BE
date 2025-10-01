import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Shipment } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { OrderStatusId } from '@mp/common/constants';
import { FinishShipmentDto } from '@mp/common/dtos';

import { FinishShipmentCommand } from './finish-shipment.command';
import { FinishShipmentCommandHandler } from './finish-shipment.command.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('FinishShipmentCommandHandler', () => {
  let handler: FinishShipmentCommandHandler;
  let shipmentService: ShipmentService;
  let shipment: ReturnType<typeof mockDeep<Shipment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinishShipmentCommandHandler,
        {
          provide: ShipmentService,
          useValue: mockDeep(ShipmentService),
        },
      ],
    }).compile();

    shipmentService = module.get<ShipmentService>(ShipmentService);

    handler = module.get<FinishShipmentCommandHandler>(
      FinishShipmentCommandHandler,
    );

    shipment = mockDeep<Shipment>();

    shipment.id = 1;
    shipment.date = mockDeep<Date>(new Date('2025-01-15'));
    shipment.vehicleId = 1;
    shipment.statusId = 1;
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call finishShipmentAsync with correct parameters', async () => {
    // Arrange
    const shipmentId = shipment.id;
    const finishShipmentDtoMock: FinishShipmentDto = {
      finishedAt: mockDeep<Date>(new Date('2025-01-15 11:35:36')),
      odometer: 125000,
      orders: [
        {
          orderId: 1,
          orderStatusId: OrderStatusId.Finished,
        },
        {
          orderId: 2,
          orderStatusId: OrderStatusId.Pending,
        },
      ],
    };
    const command = new FinishShipmentCommand(
      shipmentId,
      finishShipmentDtoMock,
    );
    const finishShipmentAsyncSpy = jest.spyOn(
      shipmentService,
      'finishShipmentAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(finishShipmentAsyncSpy).toHaveBeenCalledWith(
      command.id,
      command.finishShipmentDto,
    );
  });

  it('should throw BadRequestException if the status of any order is other than Pending or Completed', async () => {
    // Arrange
    const shipmentId = shipment.id;
    const finishShipmentDtoMock: FinishShipmentDto = {
      finishedAt: mockDeep<Date>(new Date('2025-01-15 11:35:36')),
      odometer: 125000,
      orders: [
        {
          orderId: 1,
          orderStatusId: OrderStatusId.InPreparation,
        },
        {
          orderId: 2,
          orderStatusId: OrderStatusId.Prepared,
        },
      ],
    };
    const command = new FinishShipmentCommand(
      shipmentId,
      finishShipmentDtoMock,
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
