import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeleteVehicleCommand } from './delete-vehicle.command';
import { DeleteVehicleCommandHandler } from './delete-vehicle.command.handler';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

describe('DeleteVehicleCommandHandler', () => {
  let handler: DeleteVehicleCommandHandler;
  let vehicleService: VehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleCommandHandler,
        {
          provide: VehicleService,
          useValue: mockDeep(VehicleService),
        },
      ],
    }).compile();

    vehicleService = module.get<VehicleService>(VehicleService);

    handler = module.get<DeleteVehicleCommandHandler>(
      DeleteVehicleCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call deleteVehicleAsync with correct parameters', async () => {
    // Arrange
    const command = new DeleteVehicleCommand(1);
    const deleteVehicleAsyncSpy = jest.spyOn(
      vehicleService,
      'deleteVehicleAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(deleteVehicleAsyncSpy).toHaveBeenCalledWith(
      command.vehicleId,
    );
  });
});
