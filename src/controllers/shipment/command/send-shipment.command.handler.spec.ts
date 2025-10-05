import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SendShipmentCommand } from './send-shipment.command';
import { SendShipmentCommandHandler } from './send-shipment.command.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('SendShipmentCommandHandler', () => {
  let handler: SendShipmentCommandHandler;
  let shipmentService: jest.Mocked<ShipmentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendShipmentCommandHandler,
        { provide: ShipmentService, useValue: mockDeep<ShipmentService>() },
      ],
    }).compile();

    shipmentService = module.get(ShipmentService);
    handler = module.get(SendShipmentCommandHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call both shipmentService methods with correct parameters', async () => {
    // Arrange
    const shipmentId = 1;
    const command = new SendShipmentCommand(shipmentId);

    shipmentService.getOrCreateShipmentRoute.mockResolvedValue(
      'https://maps.google.com/test',
    );
    shipmentService.sendShipmentAsync.mockResolvedValue(undefined);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(shipmentService.getOrCreateShipmentRoute).toHaveBeenCalledWith(
      shipmentId,
    );
    expect(shipmentService.sendShipmentAsync).toHaveBeenCalledWith(shipmentId);
    expect(result).toEqual({ routeUrl: 'https://maps.google.com/test' });
  });

  it('should propagate errors from shipmentService', async () => {
    const command = new SendShipmentCommand(1);
    shipmentService.getOrCreateShipmentRoute.mockRejectedValue(
      new Error('Route error'),
    );

    await expect(handler.execute(command)).rejects.toThrow('Route error');
  });
});
