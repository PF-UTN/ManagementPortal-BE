import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { ClientController } from './client.controller';
import { GetClientAddressByUserIdQuery } from './query/get-client-address-by-user-id.query';

describe('ClientController', () => {
  let controller: ClientController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep<QueryBus>(),
        },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getClientAddressByUserIdAsync', () => {
    const authorizationHeader = 'Bearer fake-token';
    const resultMock = {
      id: 1,
      address: { street: 'Calle Falsa', streetNumber: 123 },
    };

    it('should call queryBus.execute with GetClientAddressByUserIdQuery', async () => {
      // Arrange
      jest.spyOn(queryBus, 'execute').mockResolvedValue(resultMock);

      // Act
      await controller.getClientAddressByUserIdAsync(authorizationHeader);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetClientAddressByUserIdQuery(authorizationHeader),
      );
    });

    it('should return the result from queryBus.execute', async () => {
      // Arrange
      jest.spyOn(queryBus, 'execute').mockResolvedValue(resultMock);

      // Act
      const result =
        await controller.getClientAddressByUserIdAsync(authorizationHeader);

      // Assert
      expect(result).toEqual(resultMock);
    });
  });
});
