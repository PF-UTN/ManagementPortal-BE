import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeleteVehicleRepairCommand } from './delete-vehicle-repair.command';
import { DeleteVehicleRepairCommandHandler } from './delete-vehicle-repair.command.handler';
import { RepairService } from '../../../domain/service/repair/repair.service';

describe('DeleteVehicleRepairCommandHandler', () => {
  let handler: DeleteVehicleRepairCommandHandler;
  let repairService: RepairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleRepairCommandHandler,
        {
          provide: RepairService,
          useValue: mockDeep(RepairService),
        },
      ],
    }).compile();

    repairService = module.get<RepairService>(RepairService);

    handler = module.get<DeleteVehicleRepairCommandHandler>(
      DeleteVehicleRepairCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call deleteVehicleAsync with correct parameters', async () => {
    // Arrange
    const command = new DeleteVehicleRepairCommand(1);
    const deleteVehicleAsyncSpy = jest.spyOn(
      repairService,
      'deleteRepairAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(deleteVehicleAsyncSpy).toHaveBeenCalledWith(command.repairId);
  });
});
