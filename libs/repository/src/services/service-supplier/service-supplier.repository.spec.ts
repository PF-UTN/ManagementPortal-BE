import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSupplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../prisma.service';
import { ServiceSupplierRepository } from './service-supplier.repository';

describe('ServiceSupplierRepository', () => {
  let repository: ServiceSupplierRepository;
  let prismaService: PrismaService;
  let serviceSupplier: ReturnType<typeof mockDeep<ServiceSupplier>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceSupplierRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<ServiceSupplierRepository>(
      ServiceSupplierRepository,
    );

    serviceSupplier = mockDeep<ServiceSupplier>();

    serviceSupplier.id = 1;
    serviceSupplier.businessName = 'Test Service Supplier';
    serviceSupplier.documentType = 'CUIT';
    serviceSupplier.documentNumber = '12345678901';
    serviceSupplier.email = 'test@example.com';
    serviceSupplier.phone = '1234567890';
    serviceSupplier.addressId = 1;
  });

  describe('existsAsync', () => {
    it('should return true if serviceSupplier exists', async () => {
      // Arrange
      const id = serviceSupplier.id;
      jest
        .spyOn(prismaService.serviceSupplier, 'findUnique')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if serviceSupplier does not exist', async () => {
      // Arrange
      const id = serviceSupplier.id;
      jest
        .spyOn(prismaService.serviceSupplier, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(false);
    });
  });
});
