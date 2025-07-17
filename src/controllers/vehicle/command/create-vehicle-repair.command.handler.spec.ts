import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { RepairCreationDto } from '@mp/common/dtos';

import { CreateVehicleRepairCommand } from './create-vehicle-repair.command';
import { CreateVehicleRepairCommandHandler } from './create-vehicle-repair.command.handler';
import { RepairService } from '../../../domain/service/repair/repair.service';

describe('CreateRepairCommandHandler', () => {
  let handler: CreateVehicleRepairCommandHandler;
  let repairService: RepairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleRepairCommandHandler,
        {
          provide: RepairService,
          useValue: mockDeep(RepairService),
        },
      ],
    }).compile();

    repairService = module.get<RepairService>(RepairService);

    handler = module.get<CreateVehicleRepairCommandHandler>(
      CreateVehicleRepairCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createRepairAsync with correct parameters', async () => {
    // Arrange
    const vehicleId = 1;

    const repairCreationDtoMock: RepairCreationDto = {
      date: new Date('1960-01-01'),
      description: 'Puncture',
      kmPerformed: 25000,
      serviceSupplierId: 1,
    };

    const repairMock = {
      id: 1,
      date: repairCreationDtoMock.date,
      description: repairCreationDtoMock.description,
      kmPerformed: repairCreationDtoMock.kmPerformed,
      vehicleId,
      serviceSupplierId: repairCreationDtoMock.serviceSupplierId,
      deleted: false,
    };

    const command = new CreateVehicleRepairCommand(
      vehicleId,
      repairCreationDtoMock,
    );
    const createRepairAsyncSpy = jest
      .spyOn(repairService, 'createRepairAsync')
      .mockResolvedValueOnce(repairMock);

    // Act
    await handler.execute(command);

    // Assert
    expect(createRepairAsyncSpy).toHaveBeenCalledWith(
      command.vehicleId,
      command.repairCreationDto,
    );
  });
});
