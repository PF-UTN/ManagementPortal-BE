import { Test, TestingModule } from '@nestjs/testing';
import { Supplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  supplierCreationDataMock,
  supplierMock,
  suppliersMock,
  supplierWithAddressAndTownMock,
} from '@mp/common/testing';

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
    supplier.addressId = 1;
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

  describe('findByDocumentAsync', () => {
    it('should return supplier with address if found', async () => {
      // Arrange
      const documentType = supplierWithAddressAndTownMock.documentType;
      const documentNumber = supplierWithAddressAndTownMock.documentNumber;
      jest
        .spyOn(prismaService.supplier, 'findFirst')
        .mockResolvedValueOnce(supplierWithAddressAndTownMock);

      // Act
      const result = await repository.findByDocumentAsync(
        documentType,
        documentNumber,
      );

      // Assert
      expect(result).toEqual(supplierWithAddressAndTownMock);
    });

    it('should return null if supplier not found', async () => {
      // Arrange
      const documentType = supplierWithAddressAndTownMock.documentType;
      const documentNumber = supplierWithAddressAndTownMock.documentNumber;
      jest
        .spyOn(prismaService.supplier, 'findFirst')
        .mockResolvedValueOnce(null);

      // Act
      const result = await repository.findByDocumentAsync(
        documentType,
        documentNumber,
      );

      // Assert
      expect(result).toBeNull();
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

  describe('createSupplierAsync', () => {
    it('should create a supplier with the provided data', async () => {
      // Arrange
      jest
        .spyOn(prismaService.supplier, 'create')
        .mockResolvedValueOnce(supplierMock);

      // Act
      const result = await repository.createSupplierAsync(
        supplierCreationDataMock,
      );

      // Assert
      expect(result).toEqual(supplierMock);
    });

    it('should call prisma.supplier.create with correct data', async () => {
      // Arrange
      const { addressId, ...supplierData } = supplierCreationDataMock;

      jest
        .spyOn(prismaService.supplier, 'create')
        .mockResolvedValueOnce(supplierMock);

      // Act
      await repository.createSupplierAsync(supplierCreationDataMock);

      // Assert
      expect(prismaService.supplier.create).toHaveBeenCalledWith({
        data: {
          ...supplierData,
          address: {
            connect: { id: addressId },
          },
        },
      });
    });
  });

  describe('updateSupplierAsync', () => {
    it('should update the supplier with the provided data', async () => {
      // Arrange
      jest
        .spyOn(prismaService.supplier, 'update')
        .mockResolvedValueOnce(supplierMock);

      // Act
      const result = await repository.updateSupplierAsync(
        supplierMock.id,
        supplierCreationDataMock,
      );

      // Assert
      expect(result).toEqual(supplierMock);
    });

    it('should call prisma.supplier.update with correct data', async () => {
      // Arrange
      const { addressId, ...supplierData } = supplierCreationDataMock;

      jest
        .spyOn(prismaService.supplier, 'update')
        .mockResolvedValueOnce(supplierMock);

      // Act
      await repository.updateSupplierAsync(
        supplierMock.id,
        supplierCreationDataMock,
      );

      // Assert
      expect(prismaService.supplier.update).toHaveBeenCalledWith({
        where: { id: supplierMock.id },
        data: {
          ...supplierData,
          address: {
            connect: { id: addressId },
          },
        },
      });
    });
  });

  describe('findByIdAsync', () => {
    it('should return a supplier if it exists', async () => {
      // Arrange
      const supplierId = 1;
      jest
        .spyOn(prismaService.supplier, 'findUnique')
        .mockResolvedValueOnce(supplier);

      // Act
      const foundSupplier = await repository.findByIdAsync(supplierId);

      // Assert
      expect(foundSupplier).toEqual(supplier);
    });

    it('should return null if the supplier does not exist', async () => {
      // Arrange
      const supplierId = 1;
      jest
        .spyOn(prismaService.supplier, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const foundSupplier = await repository.findByIdAsync(supplierId);

      // Assert
      expect(foundSupplier).toBeNull();
    });
  });
});
