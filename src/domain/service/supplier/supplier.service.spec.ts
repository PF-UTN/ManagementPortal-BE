import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  addressMock,
  supplierCreationDataMock,
  supplierCreationDtoMock,
  supplierMock,
  suppliersMock,
} from '@mp/common/testing';
import {
  AddressRepository,
  PrismaUnitOfWork,
  SupplierRepository,
} from '@mp/repository';

import { SupplierService } from './supplier.service';
import { TownService } from '../town/town.service';

describe('SupplierService', () => {
  let service: SupplierService;
  let supplierRepository: SupplierRepository;
  let townService: TownService;
  let addressRepository: AddressRepository;
  let unitOfWork: PrismaUnitOfWork;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: SupplierRepository,
          useValue: mockDeep(SupplierRepository),
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

    supplierRepository = module.get<SupplierRepository>(SupplierRepository);
    townService = module.get<TownService>(TownService);
    addressRepository = module.get<AddressRepository>(AddressRepository);
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<SupplierService>(SupplierService);
  });

  describe('existsAsync', () => {
    it('should call supplierRepository.existsAsync with the correct id', async () => {
      // Arrange
      const id = 1;

      jest.spyOn(supplierRepository, 'existsAsync').mockResolvedValueOnce(true);

      // Act
      await service.existsAsync(id);

      // Assert
      expect(supplierRepository.existsAsync).toHaveBeenCalledWith(id);
    });
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

  describe('createOrUpdateSupplierAsync', () => {
    it('should throw BadRequestException if town does not exist', async () => {
      // Arrange
      jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createOrUpdateSupplierAsync(supplierCreationDtoMock),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should call supplierRepository.findByDocumentAsync with the correct parameters', async () => {
    // Arrange
    const { documentType, documentNumber } = supplierCreationDtoMock;
    jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
    jest
      .spyOn(supplierRepository, 'findByDocumentAsync')
      .mockResolvedValueOnce(null);

    // Act
    await service.createOrUpdateSupplierAsync(supplierCreationDtoMock);

    // Assert
    expect(supplierRepository.findByDocumentAsync).toHaveBeenCalledWith(
      documentType,
      documentNumber,
    );
  });

  it('should call supplierRepository.findByEmailAsync with the correct email', async () => {
    // Arrange
    const { email } = supplierCreationDtoMock;
    jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
    jest
      .spyOn(supplierRepository, 'findByDocumentAsync')
      .mockResolvedValueOnce(null);
    jest
      .spyOn(supplierRepository, 'findByEmailAsync')
      .mockResolvedValueOnce(null);

    // Act
    await service.createOrUpdateSupplierAsync(supplierCreationDtoMock);

    // Assert
    expect(supplierRepository.findByEmailAsync).toHaveBeenCalledWith(email);
  });

  it('should call unitOfWork.execute with the correct transaction client', async () => {
    // Arrange
    jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
    jest
      .spyOn(supplierRepository, 'findByDocumentAsync')
      .mockResolvedValueOnce(null);
    jest
      .spyOn(supplierRepository, 'findByEmailAsync')
      .mockResolvedValueOnce(null);

    const txMock = {} as Prisma.TransactionClient;

    jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
      return cb(txMock);
    });

    jest
      .spyOn(addressRepository, 'createAddressAsync')
      .mockResolvedValueOnce({ id: 1, ...addressMock });

    // Act
    await service.createOrUpdateSupplierAsync(supplierCreationDtoMock);

    // Assert
    expect(unitOfWork.execute).toHaveBeenCalled();
  });

  it('should call addressRepository.createAddressAsync with the correct address', async () => {
    // Arrange
    jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
    jest
      .spyOn(supplierRepository, 'findByDocumentAsync')
      .mockResolvedValueOnce(null);
    jest
      .spyOn(supplierRepository, 'findByEmailAsync')
      .mockResolvedValueOnce(null);

    const txMock = {} as Prisma.TransactionClient;

    jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
      return cb(txMock);
    });

    jest
      .spyOn(addressRepository, 'createAddressAsync')
      .mockResolvedValueOnce({ id: 1, ...addressMock });

    // Act
    await service.createOrUpdateSupplierAsync(supplierCreationDtoMock);

    // Assert
    expect(addressRepository.createAddressAsync).toHaveBeenCalledWith(
      supplierCreationDtoMock.address,
      txMock,
    );
  });

  it('should call supplierRepository.createSupplierAsync with the correct data', async () => {
    // Arrange
    jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
    jest
      .spyOn(supplierRepository, 'findByDocumentAsync')
      .mockResolvedValueOnce(null);
    jest
      .spyOn(supplierRepository, 'findByEmailAsync')
      .mockResolvedValueOnce(null);

    const txMock = {} as Prisma.TransactionClient;

    jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
      return cb(txMock);
    });

    jest
      .spyOn(addressRepository, 'createAddressAsync')
      .mockResolvedValueOnce({ id: 1, ...addressMock });

    // Act
    await service.createOrUpdateSupplierAsync(supplierCreationDtoMock);

    // Assert
    expect(supplierRepository.createSupplierAsync).toHaveBeenCalledWith(
      supplierCreationDataMock,
      txMock,
    );
  });

  it('should call supplierRepository.updateSupplierAsync with the correct data', async () => {
    // Arrange
    jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
    jest
      .spyOn(supplierRepository, 'findByDocumentAsync')
      .mockResolvedValueOnce(supplierMock);
    jest
      .spyOn(supplierRepository, 'findByEmailAsync')
      .mockResolvedValueOnce({ id: supplierMock.id });

    const txMock = {} as Prisma.TransactionClient;

    jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
      return cb(txMock);
    });

    jest
      .spyOn(addressRepository, 'updateAddressAsync')
      .mockResolvedValueOnce({ id: supplierMock.addressId, ...addressMock });

    // Act
    await service.createOrUpdateSupplierAsync(supplierCreationDtoMock);

    // Assert
    expect(supplierRepository.updateSupplierAsync).toHaveBeenCalledWith(
      supplierMock.id,
      supplierCreationDataMock,
      txMock,
    );
  });

  it('should call addressRepository.updateAddressAsync with the correct data', async () => {
    // Arrange
    jest.spyOn(townService, 'existsAsync').mockResolvedValueOnce(true);
    jest
      .spyOn(supplierRepository, 'findByDocumentAsync')
      .mockResolvedValueOnce(supplierMock);
    jest
      .spyOn(supplierRepository, 'findByEmailAsync')
      .mockResolvedValueOnce({ id: supplierMock.id });

    const txMock = {} as Prisma.TransactionClient;

    jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
      return cb(txMock);
    });

    jest
      .spyOn(addressRepository, 'updateAddressAsync')
      .mockResolvedValueOnce({ id: supplierMock.addressId, ...addressMock });

    // Act
    await service.createOrUpdateSupplierAsync(supplierCreationDtoMock);

    // Assert
    expect(addressRepository.updateAddressAsync).toHaveBeenCalledWith(
      supplierMock.addressId,
      supplierCreationDtoMock.address,
      txMock,
    );
  });
});
