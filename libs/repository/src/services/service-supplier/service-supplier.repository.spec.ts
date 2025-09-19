import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSupplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { ServiceSupplierCreationDataDto } from '@mp/common/dtos';

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

  describe('findByDocumentAsync', () => {
    it('should return service supplier if found', async () => {
      // Arrange
      const documentType = serviceSupplier.documentType;
      const documentNumber = serviceSupplier.documentNumber;
      jest
        .spyOn(prismaService.serviceSupplier, 'findFirst')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const result = await repository.findByDocumentAsync(
        documentType,
        documentNumber,
      );

      // Assert
      expect(result).toEqual(serviceSupplier);
    });

    it('should return null if supplier not found', async () => {
      // Arrange
      const documentType = serviceSupplier.documentType;
      const documentNumber = serviceSupplier.documentNumber;
      jest
        .spyOn(prismaService.serviceSupplier, 'findFirst')
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

  describe('findByEmailAsync', () => {
    it('should return service supplier if found', async () => {
      // Arrange
      const email = serviceSupplier.email;
      jest
        .spyOn(prismaService.serviceSupplier, 'findUnique')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const result = await repository.findByEmailAsync(email);

      // Assert
      expect(result).toEqual(serviceSupplier);
    });

    it('should return null if supplier not found', async () => {
      // Arrange
      const email = serviceSupplier.email;
      jest
        .spyOn(prismaService.serviceSupplier, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const result = await repository.findByEmailAsync(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('searchByTextAsync', () => {
    it('should construct the correct query with search text filter', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;

      // Act
      await repository.searchByTextAsync(searchText, page, pageSize);

      // Assert
      expect(prismaService.serviceSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            businessName: { contains: searchText, mode: 'insensitive' },
          },
        }),
      );
    });

    it('should construct the correct query with skip and take', async () => {
      // Arrange
      const searchText = 'test';
      const page = 2;
      const pageSize = 10;

      // Act
      await repository.searchByTextAsync(searchText, page, pageSize);

      // Assert
      expect(prismaService.serviceSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      );
    });

    it('should construct the correct query with count of total items matched', async () => {
      // Arrange
      const searchText = 'test';
      const page = 2;
      const pageSize = 10;

      // Act
      await repository.searchByTextAsync(searchText, page, pageSize);

      // Assert
      expect(prismaService.serviceSupplier.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            businessName: { contains: searchText, mode: 'insensitive' },
          },
        }),
      );
    });
  });

  describe('createServiceSupplierAsync', () => {
    it('should create a service supplier with the provided data', async () => {
      // Arrange
      const serviceSupplierCreationDataDtoMock: ServiceSupplierCreationDataDto =
        {
          businessName: serviceSupplier.businessName,
          documentType: serviceSupplier.documentType,
          documentNumber: serviceSupplier.documentNumber,
          email: serviceSupplier.email,
          phone: serviceSupplier.phone,
          addressId: serviceSupplier.addressId,
        };
      jest
        .spyOn(prismaService.serviceSupplier, 'create')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const result = await repository.createServiceSupplierAsync(
        serviceSupplierCreationDataDtoMock,
      );

      // Assert
      expect(result).toEqual(serviceSupplier);
    });

    it('should call prisma.serviceSupplier.create with correct data', async () => {
      // Arrange
      const serviceSupplierCreationDataDtoMock: ServiceSupplierCreationDataDto =
        {
          businessName: serviceSupplier.businessName,
          documentType: serviceSupplier.documentType,
          documentNumber: serviceSupplier.documentNumber,
          email: serviceSupplier.email,
          phone: serviceSupplier.phone,
          addressId: serviceSupplier.addressId,
        };
      const { addressId, ...serviceSupplierData } =
        serviceSupplierCreationDataDtoMock;

      jest
        .spyOn(prismaService.serviceSupplier, 'create')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      await repository.createServiceSupplierAsync(
        serviceSupplierCreationDataDtoMock,
      );

      // Assert
      expect(prismaService.serviceSupplier.create).toHaveBeenCalledWith({
        data: {
          ...serviceSupplierData,
          address: {
            connect: { id: addressId },
          },
        },
      });
    });
  });
  describe('updateServiceSupplierAsync', () => {
    it('should update the service supplier with the provided data', async () => {
      // Arrange
      const serviceSupplierCreationDataDtoMock: ServiceSupplierCreationDataDto =
        {
          businessName: serviceSupplier.businessName,
          documentType: serviceSupplier.documentType,
          documentNumber: serviceSupplier.documentNumber,
          email: serviceSupplier.email,
          phone: serviceSupplier.phone,
          addressId: serviceSupplier.addressId,
        };
      jest
        .spyOn(prismaService.serviceSupplier, 'update')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const result = await repository.updateServiceSupplierAsync(
        serviceSupplier.id,
        serviceSupplierCreationDataDtoMock,
      );

      // Assert
      expect(result).toEqual(serviceSupplier);
    });

    it('should call prisma.serviceSupplier.update with correct data', async () => {
      // Arrange
      const serviceSupplierCreationDataDtoMock: ServiceSupplierCreationDataDto =
        {
          businessName: serviceSupplier.businessName,
          documentType: serviceSupplier.documentType,
          documentNumber: serviceSupplier.documentNumber,
          email: serviceSupplier.email,
          phone: serviceSupplier.phone,
          addressId: serviceSupplier.addressId,
        };
      const { addressId, ...serviceSupplierData } =
        serviceSupplierCreationDataDtoMock;

      jest
        .spyOn(prismaService.serviceSupplier, 'update')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      await repository.updateServiceSupplierAsync(
        serviceSupplier.id,
        serviceSupplierCreationDataDtoMock,
      );

      // Assert
      expect(prismaService.serviceSupplier.update).toHaveBeenCalledWith({
        where: { id: serviceSupplier.id },
        data: {
          ...serviceSupplierData,
          address: {
            connect: { id: addressId },
          },
        },
      });
    });
  });

  describe('findByIdAsync', () => {
    it('should return a service supplier if it exists', async () => {
      // Arrange
      const serviceSupplierId = 1;
      jest
        .spyOn(prismaService.serviceSupplier, 'findUnique')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const foundSupplier = await repository.findByIdAsync(serviceSupplierId);

      // Assert
      expect(foundSupplier).toEqual(serviceSupplier);
    });

    it('should return null if the service supplier does not exist', async () => {
      // Arrange
      const serviceSupplierId = 1;
      jest
        .spyOn(prismaService.serviceSupplier, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const foundSupplier = await repository.findByIdAsync(serviceSupplierId);

      // Assert
      expect(foundSupplier).toBeNull();
    });
  });
});
