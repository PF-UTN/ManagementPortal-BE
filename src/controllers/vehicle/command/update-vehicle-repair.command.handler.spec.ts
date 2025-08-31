import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { UpdateRepairDto } from '@mp/common/dtos';

import { UpdateVehicleRepairCommand } from './update-vehicle-repair.command';
import { UpdateVehicleRepairCommandHandler } from './update-vehicle-repair.command.handler';
import { RepairService } from '../../../domain/service/repair/repair.service';

describe('UpdateRepairCommandHandler', () => {
  let handler: UpdateVehicleRepairCommandHandler;
  let repairService: RepairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateVehicleRepairCommandHandler,
        {
          provide: RepairService,
          useValue: mockDeep(RepairService),
        },
      ],
    }).compile();

    repairService = module.get<RepairService>(RepairService);

    handler = module.get<UpdateVehicleRepairCommandHandler>(
      UpdateVehicleRepairCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call updateRepairAsync with correct parameters', async () => {
    // Arrange
    const vehicleId = 1;

    const updateRepairDtoMock: UpdateRepairDto = {
      date: new Date('1960-01-01'),
      description: 'Puncture',
      kmPerformed: 25000,
      serviceSupplierId: 1,
    };

    const updatedRepairMock = {
      id: 1,
      date: updateRepairDtoMock.date,
      description: updateRepairDtoMock.description,
      kmPerformed: updateRepairDtoMock.kmPerformed,
      vehicleId,
      serviceSupplierId: updateRepairDtoMock.serviceSupplierId,
      deleted: false,
    };

    const command = new UpdateVehicleRepairCommand(
      vehicleId,
      updateRepairDtoMock,
    );
    const updateRepairAsyncSpy = jest
      .spyOn(repairService, 'updateRepairAsync')
      .mockResolvedValueOnce(updatedRepairMock);

    // Act
    await handler.execute(command);

    // Assert
    expect(updateRepairAsyncSpy).toHaveBeenCalledWith(
      command.repairId,
      command.updateRepairDto,
    );
  });
});
