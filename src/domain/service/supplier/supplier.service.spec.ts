import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { suppliersMock } from '@mp/common/testing';
import { SupplierRepository } from '@mp/repository';

import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let service: SupplierService;
  let supplierRepository: SupplierRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: SupplierRepository,
          useValue: mockDeep(SupplierRepository),
        },
      ],
    }).compile();

    supplierRepository = module.get<SupplierRepository>(SupplierRepository);

    service = module.get<SupplierService>(SupplierService);
  });

  describe('getAllSuppliersAsync', () => {
    it('should call supplierRepository.getAllSuppliersAsync', async () => {
      // Arrange

      jest
        .spyOn(supplierRepository, 'getAllSuppliersAsync')
        .mockResolvedValueOnce(suppliersMock);

      // Act
      await service.getAllSuppliersAsync();

      // Assert
      expect(supplierRepository.getAllSuppliersAsync).toHaveBeenCalled();
    });
  });
});