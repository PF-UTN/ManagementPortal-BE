import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

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

  describe('checkIfExistsByIdAsync', () => {
    it('should call supplierRepository.checkIfExistsByIdAsync with the correct id', async () => {
      // Arrange
      const id = 1;

      jest
        .spyOn(supplierRepository, 'checkIfExistsByIdAsync')
        .mockResolvedValueOnce(true);

      // Act
      await service.checkIfExistsByIdAsync(id);

      // Assert
      expect(supplierRepository.checkIfExistsByIdAsync).toHaveBeenCalledWith(
        id,
      );
    });
  });
});
