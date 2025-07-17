import { Test, TestingModule } from '@nestjs/testing';
import { Repair } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { RepairCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { RepairRepository } from './repair.repository';

describe('RepairRepository', () => {
  let repository: RepairRepository;
  let prismaService: PrismaService;
  let repair: ReturnType<typeof mockDeep<Repair>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<RepairRepository>(RepairRepository);

    repair = mockDeep<Repair>();

    repair.id = 1;
    repair.date = mockDeep<Date>();
    repair.description = 'Puncture';
    repair.kmPerformed = 5000;
    repair.deleted = false;
    repair.vehicleId = 1;
    repair.serviceSupplierId = 1;
  });

  describe('existsAsync', () => {
    it('should return true if repair exists', async () => {
      // Arrange
      const id = repair.id;
      jest
        .spyOn(prismaService.repair, 'findFirst')
        .mockResolvedValueOnce(repair);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if repair does not exist', async () => {
      // Arrange
      const id = repair.id;
      jest.spyOn(prismaService.repair, 'findFirst').mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('deleteRepairAsync', () => {
    it('should update an existing repair deleted field', async () => {
      // Arrange
      jest.spyOn(prismaService.repair, 'update').mockResolvedValueOnce(repair);

      // Act
      const updatedRepair = await repository.deleteRepairAsync(repair.id);

      // Assert
      expect(updatedRepair).toEqual(repair);
    });
  });

  describe('createRepairAsync', () => {
    it('should create a new repair', async () => {
      // Arrange
      const repairCreationDataMock: RepairCreationDataDto = {
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        vehicleId: repair.vehicleId,
        serviceSupplierId: repair.serviceSupplierId,
      }

      jest
        .spyOn(prismaService.repair, 'create')
        .mockResolvedValueOnce(repair);

      // Act
      const createdRepair =
        await repository.createRepairAsync(repairCreationDataMock);

      // Assert
      expect(createdRepair).toEqual(repair);
    });
  });
});
