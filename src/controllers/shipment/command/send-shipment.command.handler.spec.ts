import { Test, TestingModule } from '@nestjs/testing';
import { Shipment } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { SendShipmentCommand } from './send-shipment.command';
import { SendShipmentCommandHandler } from './send-shipment.command.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('SendShipmentCommandHandler', () => {
  let handler: SendShipmentCommandHandler;
  let shipmentService: ShipmentService;
  let shipment: ReturnType<typeof mockDeep<Shipment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendShipmentCommandHandler,
        {
          provide: ShipmentService,
          useValue: mockDeep(ShipmentService),
        },
      ],
    }).compile();

    shipmentService = module.get<ShipmentService>(ShipmentService);

    handler = module.get<SendShipmentCommandHandler>(
      SendShipmentCommandHandler,
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

  it('should call sendShipmentAsync with correct parameters', async () => {
    // Arrange
    const shipmentId = shipment.id;
    const command = new SendShipmentCommand(shipmentId);
    const sendShipmentAsyncSpy = jest.spyOn(
      shipmentService,
      'sendShipmentAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(sendShipmentAsyncSpy).toHaveBeenCalledWith(command.id);
  });
});
