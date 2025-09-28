import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Shipment } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { ShipmentCreationDto } from '@mp/common/dtos';

import { CreateShipmentCommand } from './create-shipment.command';
import { CreateShipmentCommandHandler } from './create-shipment.command.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('CreateProductCommandHandler', () => {
  let handler: CreateShipmentCommandHandler;
  let shipmentService: ShipmentService;
  let shipment: ReturnType<typeof mockDeep<Shipment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateShipmentCommandHandler,
        {
          provide: ShipmentService,
          useValue: mockDeep(ShipmentService),
        },
      ],
    }).compile();

    shipmentService = module.get<ShipmentService>(ShipmentService);

    handler = module.get<CreateShipmentCommandHandler>(
      CreateShipmentCommandHandler,
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

  it('should throw BadRequestException if there are not orders', async () => {
    // Arrange
    const shipmentCreationDtoMock: ShipmentCreationDto = {
      date: shipment.date,
      vehicleId: shipment.vehicleId,
      orderIds: [],
    };

    const command = new CreateShipmentCommand(shipmentCreationDtoMock);

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should call createShipmentAsync with correct parameters', async () => {
    // Arrange
    const shipmentCreationDtoMock: ShipmentCreationDto = {
      date: shipment.date,
      vehicleId: shipment.vehicleId,
      orderIds: [1, 2, 3],
    };
    const command = new CreateShipmentCommand(shipmentCreationDtoMock);
    const createOrUpdateShipmentAsyncSpy = jest.spyOn(
      shipmentService,
      'createShipmentAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(createOrUpdateShipmentAsyncSpy).toHaveBeenCalledWith(
      command.shipmentCreationDto,
    );
  });
});
