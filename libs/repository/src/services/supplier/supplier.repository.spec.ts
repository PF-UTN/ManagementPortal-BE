import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { suppliersMock } from '@mp/common/testing';

import { PrismaService } from '../prisma.service';
import { SupplierRepository } from './supplier.repository';

describe('SupplierRepository', () => {
  let repository: SupplierRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<SupplierRepository>(SupplierRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getAllSuppliersAsync', () => {
    it('should call prisma.supplier.findMany with correct order and return the result', async () => {
      // Arrange
      jest
        .spyOn(prismaService.supplier, 'findMany')
        .mockResolvedValueOnce(suppliersMock);

      // Act
      const result = await repository.getAllSuppliersAsync();

      // Assert
      expect(prismaService.supplier.findMany).toHaveBeenCalledWith({
        orderBy: { businessName: 'asc' },
      });

      expect(result).toEqual(suppliersMock);
    });
  });
});
