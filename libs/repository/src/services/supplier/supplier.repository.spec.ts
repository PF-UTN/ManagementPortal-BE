import { Test, TestingModule } from '@nestjs/testing';
import { Supplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { suppliersMock } from '@mp/common/testing';

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

  describe('existsAsync', () => {
    it('should return true if supplier exists', async () => {
      // Arrange
      const supplierId = 1;
      jest
        .spyOn(prismaService.supplier, 'findUnique')
        .mockResolvedValueOnce(supplier);

      // Act
      const exists = await repository.existsAsync(supplierId);

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
      const exists = await repository.existsAsync(supplierId);

      // Assert
      expect(exists).toBe(false);
    });
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
