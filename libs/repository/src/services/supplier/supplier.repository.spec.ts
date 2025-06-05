import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

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
      const suppliersMock = [
        {
          id: 1,
          businessName: 'Acme Inc.',
          documentType: 'CUIT',
          documentNumber: '30-12345678-9',
          email: 'info@acme.com',
          phone: '+54 11 1234-5678',
        },
        {
          id: 2,
          businessName: 'Zeta Corp.',
          documentType: 'CUIT',
          documentNumber: '30-98765432-1',
          email: 'contact@zetacorp.com',
          phone: '+54 11 8765-4321',
        },
      ];

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
