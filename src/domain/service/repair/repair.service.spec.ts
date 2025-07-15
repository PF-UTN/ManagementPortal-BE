import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repair } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { RepairRepository } from '@mp/repository';

import { RepairService } from './repair.service';

describe('RepairService', () => {
  let service: RepairService;
  let repository: RepairRepository;
  let repair: ReturnType<typeof mockDeep<Repair>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairService,
        {
          provide: RepairRepository,
          useValue: mockDeep(RepairRepository),
        },
      ],
    }).compile();

    repository = module.get<RepairRepository>(RepairRepository);

    service = module.get<RepairService>(RepairService);

    repair = mockDeep<Repair>();

    repair.id = 1;
    repair.date = mockDeep<Date>();
    repair.description = 'Puncture';
    repair.kmPerformed = 5000;
    repair.deleted = false;
    repair.vehicleId = 1;
  });

  describe('deleteRepairAsync', () => {
    it('should call deleteRepairAsync on the repository with correct parameters', async () => {
      // Arrange
      const repairId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest.spyOn(repository, 'deleteRepairAsync').mockResolvedValueOnce(repair);

      // Act
      await service.deleteRepairAsync(repairId);

      // Assert
      expect(repository.deleteRepairAsync).toHaveBeenCalledWith(repairId);
    });

    it('should throw NotFoundException if repair does not exist', async () => {
      // Arrange
      const repairId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(service.deleteRepairAsync(repairId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
