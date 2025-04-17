import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RegistrationRequestDetailsDto } from '@mp/common/dtos';

import { GetRegistrationRequestByIdQuery } from './get-registration-request-by-id.query';
import { GetRegistrationRequestByIdQueryHandler } from './get-registration-request-by-id.query.handler';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';

const mockRegistrationRequestDomainService = {
  findRegistrationRequestWithDetailsByIdAsync: jest.fn(),
};

describe('GetRegistrationRequestByIdQueryHandler', () => {
  let handler: GetRegistrationRequestByIdQueryHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRegistrationRequestByIdQueryHandler,
        {
          provide: RegistrationRequestDomainService,
          useValue: mockRegistrationRequestDomainService,
        },
      ],
    }).compile();

    handler = module.get<GetRegistrationRequestByIdQueryHandler>(
      GetRegistrationRequestByIdQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return RegistrationRequestDetailsDto when registration request is found', async () => {
      // Arrange
      const query = new GetRegistrationRequestByIdQuery(1);
      const mockRegistrationRequest = {
        id: 1,
        requestDate: new Date(),
        status: { code: 'Approved' },
        note: 'Test note',
        user: {
          firstName: 'John',
          lastName: 'Doe',
          documentNumber: '123456789',
          documentType: 'DNI',
          email: 'john.doe@example.com',
          phone: '1234567890',
        },
      };
      mockRegistrationRequestDomainService.findRegistrationRequestWithDetailsByIdAsync.mockResolvedValue(
        mockRegistrationRequest,
      );

      const expectedResult: RegistrationRequestDetailsDto = {
        id: mockRegistrationRequest.id,
        requestDate: mockRegistrationRequest.requestDate,
        status: mockRegistrationRequest.status.code,
        note: mockRegistrationRequest.note,
        user: {
          fullNameOrBusinessName: 'John Doe',
          documentNumber: '123456789',
          documentType: 'DNI',
          email: 'john.doe@example.com',
          phone: '1234567890',
        },
      };

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when registration request is not found', async () => {
      // Arrange
      const query = new GetRegistrationRequestByIdQuery(1);
      mockRegistrationRequestDomainService.findRegistrationRequestWithDetailsByIdAsync.mockResolvedValue(
        null,
      );

      // Act
      const executePromise = handler.execute(query);

      // Assert
      await expect(executePromise).rejects.toEqual(
        new NotFoundException('Registration request with ID 1 not found'),
      );
    });
  });
});
