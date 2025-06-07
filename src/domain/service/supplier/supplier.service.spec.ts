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

  describe('existsAsync', () => {
    it('should call supplierRepository.existsAsync with the correct id', async () => {
      // Arrange
      const id = 1;

      jest
        .spyOn(supplierRepository, 'existsAsync')
        .mockResolvedValueOnce(true);

      // Act
      await service.existsAsync(id);

      // Assert
      expect(supplierRepository.existsAsync).toHaveBeenCalledWith(
        id,
      );
    });
  });
});
