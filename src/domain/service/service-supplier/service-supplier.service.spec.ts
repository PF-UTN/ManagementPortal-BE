import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Address, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  ServiceSupplierCreationDataDto,
  ServiceSupplierCreationDto,
} from '@mp/common/dtos';
import {
  AddressRepository,
  PrismaUnitOfWork,
  ServiceSupplierRepository,
} from '@mp/repository';

import { ServiceSupplierService } from './service-supplier.service';
import { SearchServiceSupplierQuery } from '../../../controllers/service-supplier/query/search-service-supplier.query';
import { TownService } from '../town/town.service';

describe('ServiceSupplierService', () => {
  let service: ServiceSupplierService;
  let serviceSupplierRepository: ServiceSupplierRepository;
  let townService: TownService;
  let addressRepository: AddressRepository;
  let unitOfWork: PrismaUnitOfWork;
  let serviceSupplier: ReturnType<
    typeof mockDeep<
      Prisma.ServiceSupplierGetPayload<{
        include: {
          address: {
            include: {
              town: true;
            };
          };
        };
      }>
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceSupplierService,
        {
          provide: ServiceSupplierRepository,
          useValue: mockDeep(ServiceSupplierRepository),
        },
        {
          provide: TownService,
          useValue: mockDeep(TownService),
        },
        {
          provide: AddressRepository,
          useValue: mockDeep(AddressRepository),
        },
        {
          provide: PrismaUnitOfWork,
          useValue: mockDeep(PrismaUnitOfWork),
        },
      ],
    }).compile();

    serviceSupplierRepository = module.get<ServiceSupplierRepository>(
      ServiceSupplierRepository,
    );
    townService = module.get<TownService>(TownService);
    addressRepository = module.get<AddressRepository>(AddressRepository);
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<ServiceSupplierService>(ServiceSupplierService);

    serviceSupplier = mockDeep<
      Prisma.ServiceSupplierGetPayload<{
        include: {
          address: {
            include: {
              town: true;
            };
          };
        };
      }>
    >();

    serviceSupplier.id = 1;
    serviceSupplier.businessName = 'Test Service Supplier';
    serviceSupplier.documentType = 'CUIT';
    serviceSupplier.documentNumber = '12345678901';
    serviceSupplier.email = 'test@example.com';
    serviceSupplier.phone = '1234567890';
    serviceSupplier.addressId = 1;
    serviceSupplier.address = {
      id: 1,
      townId: 1,
      street: 'Test Street',
      streetNumber: 123,
      town: {
        id: 1,
        name: 'Test Town',
        zipCode: 'Test Zip Code',
        provinceId: 1,
      },
    };
  });

  describe('createOrUpdateServiceSupplierAsync', () => {
    let serviceSupplierCreationDtoMock: ServiceSupplierCreationDto;

    beforeEach(() => {
      serviceSupplierCreationDtoMock = {
        businessName: serviceSupplier.businessName,
        documentType: serviceSupplier.documentType,
        documentNumber: serviceSupplier.documentNumber,
        email: serviceSupplier.email,
        phone: serviceSupplier.phone,
        address: serviceSupplier.address,
      };
    });

    it('should throw NotFoundException if town does not exist', async () => {
      // Arrange
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createOrUpdateServiceSupplierAsync(
          serviceSupplierCreationDtoMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call serviceSupplierRepository.findByDocumentAsync with the correct parameters', async () => {
      // Arrange
      const { documentType, documentNumber } = serviceSupplierCreationDtoMock;
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(null);

      // Act
      await service.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(
        serviceSupplierRepository.findByDocumentAsync,
      ).toHaveBeenCalledWith(documentType, documentNumber);
    });

    it('should call serviceSupplierRepository.findByEmailAsync with the correct parameters', async () => {
      // Arrange
      const { email } = serviceSupplierCreationDtoMock;
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(serviceSupplierRepository, 'findByEmailAsync')
        .mockResolvedValueOnce(null);

      // Act
      await service.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(serviceSupplierRepository.findByEmailAsync).toHaveBeenCalledWith(
        email,
      );
    });

    it('should call unitOfWork.execute with the correct transaction client', async () => {
      // Arrange
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(serviceSupplierRepository, 'findByEmailAsync')
        .mockResolvedValueOnce(null);

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest
        .spyOn(addressRepository, 'createAddressAsync')
        .mockResolvedValueOnce(mockDeep<Address>());

      // Act
      await service.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(unitOfWork.execute).toHaveBeenCalled();
    });

    it('should call addressRepository.createAddressAsync with the correct address', async () => {
      // Arrange
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(serviceSupplierRepository, 'findByEmailAsync')
        .mockResolvedValueOnce(null);

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest
        .spyOn(addressRepository, 'createAddressAsync')
        .mockResolvedValueOnce(mockDeep<Address>());

      // Act
      await service.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(addressRepository.createAddressAsync).toHaveBeenCalledWith(
        serviceSupplierCreationDtoMock.address,
        txMock,
      );
    });

    it('should call serviceSupplierRepository.createServiceSupplierAsync with the correct data', async () => {
      // Arrange
      const serviceSupplierCreationDataMock: ServiceSupplierCreationDataDto = {
        businessName: serviceSupplier.businessName,
        documentType: serviceSupplier.documentType,
        documentNumber: serviceSupplier.documentNumber,
        email: serviceSupplier.email,
        phone: serviceSupplier.phone,
        addressId: serviceSupplier.addressId,
      };
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(serviceSupplierRepository, 'findByEmailAsync')
        .mockResolvedValueOnce(null);

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest
        .spyOn(addressRepository, 'createAddressAsync')
        .mockResolvedValueOnce(serviceSupplier.address);

      // Act
      await service.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(
        serviceSupplierRepository.createServiceSupplierAsync,
      ).toHaveBeenCalledWith(serviceSupplierCreationDataMock, txMock);
    });

    it('should call serviceSupplierRepository.updateServiceSupplierAsync with the correct data', async () => {
      // Arrange
      const serviceSupplierCreationDataMock: ServiceSupplierCreationDataDto = {
        businessName: serviceSupplier.businessName,
        documentType: serviceSupplier.documentType,
        documentNumber: serviceSupplier.documentNumber,
        email: serviceSupplier.email,
        phone: serviceSupplier.phone,
        addressId: serviceSupplier.addressId,
      };
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(serviceSupplier);
      jest
        .spyOn(serviceSupplierRepository, 'findByEmailAsync')
        .mockResolvedValueOnce({
          id: serviceSupplier.id,
        });

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest
        .spyOn(addressRepository, 'updateAddressAsync')
        .mockResolvedValueOnce(serviceSupplier.address);

      // Act
      await service.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(
        serviceSupplierRepository.updateServiceSupplierAsync,
      ).toHaveBeenCalledWith(
        serviceSupplier.id,
        serviceSupplierCreationDataMock,
        txMock,
      );
    });

    it('should call addressRepository.updateAddressAsync with the correct data', async () => {
      // Arrange
      const serviceSupplierCreationDataMock: ServiceSupplierCreationDataDto = {
        businessName: serviceSupplier.businessName,
        documentType: serviceSupplier.documentType,
        documentNumber: serviceSupplier.documentNumber,
        email: serviceSupplier.email,
        phone: serviceSupplier.phone,
        addressId: serviceSupplier.addressId,
      };
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(serviceSupplier);
      jest
        .spyOn(serviceSupplierRepository, 'findByEmailAsync')
        .mockResolvedValueOnce({
          id: serviceSupplier.id,
        });

      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest
        .spyOn(addressRepository, 'updateAddressAsync')
        .mockResolvedValueOnce(serviceSupplier.address);

      // Act
      await service.createOrUpdateServiceSupplierAsync(
        serviceSupplierCreationDtoMock,
      );

      // Assert
      expect(addressRepository.updateAddressAsync).toHaveBeenCalledWith(
        serviceSupplierCreationDataMock.addressId,
        serviceSupplierCreationDtoMock.address,
        txMock,
      );
    });
  });

  describe('searchByTextAsync', () => {
    it('should call searchByTextAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;

      const query = new SearchServiceSupplierQuery({
        searchText,
        page,
        pageSize,
      });

      // Act
      await service.searchByTextAsync(query);

      // Assert
      expect(serviceSupplierRepository.searchByTextAsync).toHaveBeenCalledWith(
        query.searchText,
        query.page,
        query.pageSize,
      );
    });
  });

  describe('findByIdAsync', () => {
    let serviceSupplierId: number;

    beforeEach(() => {
      serviceSupplierId = 1;
    });

    it('should throw NotFoundException if service supplier does not exist', async () => {
      // Arrange
      jest
        .spyOn(serviceSupplierRepository, 'findByIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findByIdAsync(serviceSupplierId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call findByIdAsync on the repository with correct parameters', async () => {
      // Arrange
      jest
        .spyOn(serviceSupplierRepository, 'findByIdAsync')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      await service.findByIdAsync(serviceSupplierId);

      // Assert
      expect(serviceSupplierRepository.findByIdAsync).toHaveBeenCalledWith(
        serviceSupplierId,
      );
    });

    it('should return the service supplier if found', async () => {
      // Arrange
      jest
        .spyOn(serviceSupplierRepository, 'findByIdAsync')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const result = await service.findByIdAsync(serviceSupplierId);

      // Assert
      expect(result).toEqual(serviceSupplier);
    });
  });

  describe('findByDocumentAsync', () => {
    it('should call serviceSupplierRepository.findByDocumentAsync with the correct parameters', async () => {
      // Arrange
      const documentType = serviceSupplier.documentType;
      const documentNumber = serviceSupplier.documentNumber;

      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      await service.findByDocumentAsync(documentType, documentNumber);

      // Assert
      expect(
        serviceSupplierRepository.findByDocumentAsync,
      ).toHaveBeenCalledWith(documentType, documentNumber);
    });

    it('should return the service supplier founded by document', async () => {
      // Arrange
      const documentType = serviceSupplier.documentType;
      const documentNumber = serviceSupplier.documentNumber;
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(serviceSupplier);

      // Act
      const result = await service.findByDocumentAsync(
        documentType,
        documentNumber,
      );

      // Assert
      expect(result).toEqual(serviceSupplier);
    });

    it('should throw NotFoundException if no service supplier is found', async () => {
      // Arrange
      const documentType = serviceSupplier.documentType;
      const documentNumber = serviceSupplier.documentNumber;
      jest
        .spyOn(serviceSupplierRepository, 'findByDocumentAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.findByDocumentAsync(documentType, documentNumber),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
