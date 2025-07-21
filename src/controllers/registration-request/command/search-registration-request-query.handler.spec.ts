import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { SearchRegistrationRequestResponse } from '@mp/common/dtos';
import { RegistrationRequestDomainServiceMock } from '@mp/common/testing';

import { SearchRegistrationRequestQuery } from './search-registration-request-query';
import { SearchRegistrationRequestQueryHandler } from './search-registration-request-query.handler';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';

describe('SearchRegistrationRequestQueryHandler', () => {
  let handler: SearchRegistrationRequestQueryHandler;
  let registrationRequestService: RegistrationRequestDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchRegistrationRequestQueryHandler,
        {
          provide: RegistrationRequestDomainService,
          useValue: mockDeep(RegistrationRequestDomainServiceMock),
        },
      ],
    }).compile();

    handler = module.get<SearchRegistrationRequestQueryHandler>(
      SearchRegistrationRequestQueryHandler,
    );
    registrationRequestService = module.get<RegistrationRequestDomainService>(
      RegistrationRequestDomainService,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchWithFiltersAsync on the service with correct parameters', async () => {
    // Arrange
    const query = new SearchRegistrationRequestQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: { status: ['Pending'] },
    });

    jest
      .spyOn(registrationRequestService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: [], total: 0 });

    // Act
    await handler.execute(query);

    // Assert
    expect(
      registrationRequestService.searchWithFiltersAsync,
    ).toHaveBeenCalledWith(query);
  });

  it('should map the response correctly', async () => {
    // Arrange
    const query = new SearchRegistrationRequestQuery({
      searchText: 'test',
      page: 1,
      pageSize: 1,
      filters: { status: ['Pending'] },
    });
    const result = [
      mockDeep<
        Prisma.RegistrationRequestGetPayload<{
          include: {
            status: true;
            user: {
              include: {
                client: {
                  include: {
                    taxCategory: true;
                    address: {
                      include: {
                        town: {
                          select: {
                            name: true;
                            zipCode: true;
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        }>
      >({
        id: 1,
        statusId: 5,
        userId: 10,
        note: 'Test note',
        requestDate: new Date(),
        status: { id: 5, code: 'Pendiente' },
        user: {
          id: 10,
          firstName: 'John',
          lastName: 'Doe',
          documentNumber: '12345678',
          documentType: 'DNI',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          password: 'password',
          roleId: 1,
          accountLockedUntil: null,
          failedLoginAttempts: 0,
          client: {
            taxCategory: {
              name: 'Monotributo',
            },
            address: {
              street: 'Main St',
              streetNumber: 56,
              town: {
                name: 'Springfield',
                zipCode: '12345',
              },
            },
          },
        },
      }),
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchRegistrationRequestResponse({
      total: expectedTotal,
      results: result.map((registrationRequest) => ({
        id: registrationRequest.id,
        requestDate: registrationRequest.requestDate,
        status: registrationRequest.status.code,
        user: {
          fullNameOrBusinessName: `${registrationRequest.user.firstName} ${registrationRequest.user.lastName}`,
          documentNumber: registrationRequest.user.documentNumber,
          documentType: registrationRequest.user.documentType,
          email: registrationRequest.user.email,
          phone: registrationRequest.user.phone,
          taxCategory: registrationRequest.user.client!.taxCategory.name,
          address: {
            streetAddress:
              registrationRequest.user.client!.address.street +
              ' ' +
              registrationRequest.user.client!.address.streetNumber,
            town: registrationRequest.user.client!.address.town.name,
            zipCode: registrationRequest.user.client!.address.town.zipCode,
          },
        },
      })),
    });

    jest
      .spyOn(registrationRequestService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    // Act
    const response = await handler.execute(query);

    // Assert
    expect(response).toEqual(expectedResponse);
  });
});
