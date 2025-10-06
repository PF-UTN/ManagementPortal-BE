import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { clientAddressMockInService } from '@mp/common/testing';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { ClientService } from './../../../domain/service/client/client.service';
import { GetClientAddressByUserIdQuery } from './get-client-address-by-user-id.query';
import { GetClientAddressByUserIdQueryHandler } from './get-client-address-by-user-id.query.handler';

describe('GetClientAddressByUserIdQueryHandler', () => {
  let handler: GetClientAddressByUserIdQueryHandler;
  let clientService: ClientService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientAddressByUserIdQueryHandler,
        {
          provide: ClientService,
          useValue: mockDeep<ClientService>(),
        },
        {
          provide: AuthenticationService,
          useValue: mockDeep<AuthenticationService>(),
        },
      ],
    }).compile();

    handler = module.get<GetClientAddressByUserIdQueryHandler>(
      GetClientAddressByUserIdQueryHandler,
    );
    clientService = module.get<ClientService>(ClientService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const token = 'fake-token';
    const authorizationHeader = `Bearer ${token}`;
    const payloadMock = {
      sub: 1,
      email: 'test@test.com',
      role: 'User',
      permissions: [],
    };

    it('should call authenticationService.decodeTokenAsync with the token extracted from authorizationHeader', async () => {
      // Arrange
      const query = new GetClientAddressByUserIdQuery(authorizationHeader);
      const decodeSpy = jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientAddressByUserIdAsync')
        .mockResolvedValue(clientAddressMockInService);

      // Act
      await handler.execute(query);

      // Assert
      expect(decodeSpy).toHaveBeenCalledWith(token);
    });

    it('should call clientService.findClientAddressByUserIdAsync with the userId from payload.sub', async () => {
      // Arrange
      const query = new GetClientAddressByUserIdQuery(authorizationHeader);
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      const clientSpy = jest
        .spyOn(clientService, 'findClientAddressByUserIdAsync')
        .mockResolvedValue(clientAddressMockInService);

      // Act
      await handler.execute(query);

      // Assert
      expect(clientSpy).toHaveBeenCalledWith(payloadMock.sub);
    });

    it('should return the client address from clientService', async () => {
      // Arrange
      const query = new GetClientAddressByUserIdQuery(authorizationHeader);
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientAddressByUserIdAsync')
        .mockResolvedValue(clientAddressMockInService);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(clientAddressMockInService);
    });
  });
});
