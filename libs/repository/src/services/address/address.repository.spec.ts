import { Test, TestingModule } from '@nestjs/testing';
import { Address } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { AddressCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { AddressRepository } from './address.repository';

describe('AddressRepository', () => {
  let repository: AddressRepository;
  let prismaService: PrismaService;
  let address: ReturnType<typeof mockDeep<Address>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<AddressRepository>(AddressRepository);

    address = mockDeep<Address>();

    address.id = 1;
    address.townId = 1;
    address.street = 'Main St';
    address.streetNumber = 12345;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createAddressAsync', () => {
    it('should create a new address', async () => {
      // Arrange
      const addressData: AddressCreationDto = {
        townId: address.townId,
        street: address.street,
        streetNumber: address.streetNumber,
      };
      const addressCreateInput = {
        ...addressData,
        town: { connect: { id: addressData.townId } },
      };

      jest
        .spyOn(prismaService.address, 'create')
        .mockResolvedValueOnce(address);

      // Act
      const result = await repository.createAddressAsync(addressCreateInput);

      // Assert
      expect(result).toEqual(address);
    });
  });
});
