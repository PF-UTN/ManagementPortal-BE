import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { UpdateVehicleDto } from '@mp/common/dtos';

import { UpdateVehicleCommand } from './update-vehicle.command';
import { UpdateVehicleCommandHandler } from './update-vehicle.command.handler';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

describe('UpdateVehicleCommandHandler', () => {
  let handler: UpdateVehicleCommandHandler;
  let vehicleService: VehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateVehicleCommandHandler,
        {
          provide: VehicleService,
          useValue: mockDeep(VehicleService),
        },
      ],
    }).compile();

    vehicleService = module.get<VehicleService>(VehicleService);

    handler = module.get<UpdateVehicleCommandHandler>(
      UpdateVehicleCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call updateVehicleAsync with correct parameters', async () => {
    // Arrange
    const vehicleUpdateDtoMock: UpdateVehicleDto = {
      brand: 'Toyota',
      model: 'Corolla',
      kmTraveled: 25000,
      admissionDate: new Date('2023-10-01'),
      enabled: true,
    };

    const vehicleMock = {
      id: 1,
      licensePlate: 'AB213LM',
      brand: 'Toyota',
      model: 'Corolla',
      kmTraveled: 25000,
      admissionDate: new Date('2023-10-01'),
      enabled: true,
      deleted: false,
      updatedAt: new Date('2025-01-01'),
      createdAt: new Date('2025-02-01'),
    };

    const command = new UpdateVehicleCommand(
      vehicleMock.id,
      vehicleUpdateDtoMock,
    );
    const updateVehicleAsyncSpy = jest
      .spyOn(vehicleService, 'updateVehicleAsync')
      .mockResolvedValueOnce(vehicleMock);

    // Act
    await handler.execute(command);

    // Assert
    expect(updateVehicleAsyncSpy).toHaveBeenCalledWith(
      command.id,
      command.updateVehicleDto,
    );
  });
});
