import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { clientMock } from './../../../../libs/common/src/testing/client.mock';
import { ClientRepository } from './../../../../libs/repository/src/services/client/client.repository';
import { ClientService } from './client.service';

describe('ClientService', () => {
  let service: ClientService;
  let clientRepository: ClientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: ClientRepository, useValue: mockDeep<ClientRepository>() },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    clientRepository = module.get<ClientRepository>(ClientRepository);
  });

  it('should return client when found', async () => {
    // Arrange
    jest
      .spyOn(clientRepository, 'findClientByIdAsync')
      .mockResolvedValue(clientMock);

    // Act
    const result = await service.findClientByIdAsync(clientMock.id);

    // Assert
    expect(clientRepository.findClientByIdAsync).toHaveBeenCalledWith(
      clientMock.id,
    );
    expect(result).toEqual(clientMock);
  });

  it('should return null when client not found', async () => {
    // Arrange
    jest.spyOn(clientRepository, 'findClientByIdAsync').mockResolvedValue(null);

    // Act
    const result = await service.findClientByIdAsync(999);

    // Assert
    expect(clientRepository.findClientByIdAsync).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });
  describe('findClientByUserIdAsync', () => {
    it('should return client when found by userId', async () => {
      // Arrange
      jest
        .spyOn(clientRepository, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);

      // Act
      const result = await service.findClientByUserIdAsync(clientMock.userId);

      // Assert
      expect(clientRepository.findClientByUserIdAsync).toHaveBeenCalledWith(
        clientMock.userId,
      );
      expect(result).toEqual(clientMock);
    });

    it('should return null when client not found by userId', async () => {
      // Arrange
      jest
        .spyOn(clientRepository, 'findClientByUserIdAsync')
        .mockResolvedValue(null);
      // Act
      const result = await service.findClientByUserIdAsync(999);
      // Assert
      expect(clientRepository.findClientByUserIdAsync).toHaveBeenCalledWith(
        999,
      );
      expect(result).toBeNull();
    });
  });
});
