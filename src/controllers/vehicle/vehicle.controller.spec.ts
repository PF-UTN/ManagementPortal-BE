import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { CreateVehicleCommand } from './command/create-vehicle.command';
import { VehicleController } from './vehicle.controller';

describe('VehicleController', () => {
  let controller: VehicleController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockDeep<CommandBus>(),
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVehicleAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const vehicleCreationDtoMock = {
        licensePlate: 'AB213LM',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: '2023-10-01',
        enabled: true,
        deleted: false,
      };
      const expectedCommand = new CreateVehicleCommand(vehicleCreationDtoMock);

      // Act
      await controller.createVehicleAsync(vehicleCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
