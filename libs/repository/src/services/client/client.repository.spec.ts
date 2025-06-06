import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { ClientCreationDto } from '@mp/common/dtos';
import { newClientMock } from '@mp/common/testing';

import { ClientRepository } from './client.repository';
import { PrismaService } from '../prisma.service';

describe('ClientRepository', () => {
  let repository: ClientRepository;
  let prismaService: PrismaService;
  let createClientMock: ClientCreationDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<ClientRepository>(ClientRepository);

    createClientMock = {
      companyName: 'Test Company',
      userId: 1,
      taxCategoryId: 1,
      addressId: 1,
    };
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createClientAsync', () => {
    it('should create a new client', async () => {
      // Arrange
      jest
        .spyOn(prismaService.client, 'create')
        .mockResolvedValueOnce(newClientMock);

      // Act
      const result = await repository.createClientAsync(createClientMock);

      // Assert
      expect(result).toEqual(newClientMock);
    });

    it('should create a new client with transaction', async () => {
      // Arrange
      const tx = mockDeep<Prisma.TransactionClient>();

      jest.spyOn(tx.client, 'create').mockResolvedValueOnce(newClientMock);

      // Act
      const result = await repository.createClientAsync(createClientMock, tx);

      // Assert
      expect(result).toEqual(newClientMock);
    });
  });
});
