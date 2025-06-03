import { Test, TestingModule } from '@nestjs/testing';
import { Supplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../prisma.service';
import { SupplierRepository } from './supplier.repository';

describe('SupplierRepository', () => {
  let repository: SupplierRepository;
  let prismaService: PrismaService;
  let supplier: ReturnType<typeof mockDeep<Supplier>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<SupplierRepository>(SupplierRepository);

    supplier = mockDeep<Supplier>();

    supplier.id = 1;
    supplier.businessName = 'Test Supplier';
    supplier.documentType = 'CUIT';
    supplier.documentNumber = '12345678901';
    supplier.email = 'test-supplier@mp.com';
    supplier.phone = '1234567890';
  });

  describe('checkIfExistsByIdAsync', () => {
    it('should return true if supplier exists', async () => {
      // Arrange
      const supplierId = 1;
      jest
        .spyOn(prismaService.supplier, 'findUnique')
        .mockResolvedValueOnce(supplier);

      // Act
      const exists = await repository.checkIfExistsByIdAsync(supplierId);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if supplier does not exist', async () => {
      // Arrange
      const supplierId = 1;
      jest
        .spyOn(prismaService.supplier, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.checkIfExistsByIdAsync(supplierId);

      // Assert
      expect(exists).toBe(false);
    });
  });
});
