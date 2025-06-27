import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { CreateVehicleCommand } from './create-vehicle.command';
import { CreateVehicleCommandHandler } from './create-vehicle.command.handler';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

describe('CreateVehicleCommandHandler', () => {
  let handler: CreateVehicleCommandHandler;
  let vehicleService: VehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleCommandHandler,
        {
          provide: VehicleService,
          useValue: mockDeep(VehicleService),
        },
      ],
    }).compile();

    vehicleService = module.get<VehicleService>(VehicleService);

    handler = module.get<CreateVehicleCommandHandler>(
      CreateVehicleCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createVehicleAsync with correct parameters', async () => {
    // Arrange
    const vehicleCreationDtoMock = {
      licensePlate: 'AB213LM',
      brand: 'Toyota',
      model: 'Corolla',
      kmTraveled: 25000,
      admissionDate: '2023-10-01',
      enabled: true,
      deleted: false,
    };

    const command = new CreateVehicleCommand(vehicleCreationDtoMock);
    const createVehicleAsyncSpy = jest.spyOn(
      vehicleService,
      'createVehicleAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(createVehicleAsyncSpy).toHaveBeenCalledWith(
      command.vehicleCreationDto,
    );
  });
});
