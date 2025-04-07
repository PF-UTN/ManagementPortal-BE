import { Test, TestingModule } from '@nestjs/testing';
import { SearchRegistrationRequestResponse } from '@mp/common/dtos';
import { RegistrationRequestDomainServiceMock } from '@mp/common/testing';
import { SearchRegistrationRequestQueryHandler } from './search-registration-request-query.handler';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { SearchRegistrationRequestQuery } from './search-registration-request-query';

describe('SearchRegistrationRequestQueryHandler', () => {
  let handler: SearchRegistrationRequestQueryHandler;
  let registrationRequestServiceMock: RegistrationRequestDomainServiceMock;

  beforeEach(async () => {
    registrationRequestServiceMock = new RegistrationRequestDomainServiceMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchRegistrationRequestQueryHandler,
        {
          provide: RegistrationRequestDomainService,
          useValue: registrationRequestServiceMock,
        },
      ],
    }).compile();

    handler = module.get<SearchRegistrationRequestQueryHandler>(
      SearchRegistrationRequestQueryHandler,
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
      .spyOn(registrationRequestServiceMock, 'searchWithFiltersAsync')
      .mockResolvedValue([]);

    // Act
    await handler.execute(query);

    // Assert
    expect(
      registrationRequestServiceMock.searchWithFiltersAsync,
    ).toHaveBeenCalledWith(query);
  });

  it('should map the response correctly', async () => {
    // Arrange
    const query = new SearchRegistrationRequestQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: { status: ['Pending'] },
    });

    const result = [
      {
        id: 1,
        statusId: 5,
        userId: 10,
        note: 'Test note',
        requestDate: new Date(),
        status: { id: 5, code: 'Pending' },
        user: {
          id: 10,
          firstName: 'John',
          lastName: 'Doe',
          documentNumber: '12345678',
          documentType: 'DNI',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          registrationRequestId: 1,
          password: 'password',
        },
      },
    ];

    const expectedResponse = new SearchRegistrationRequestResponse({
      total: result.length,
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
        },
      })),
    });

    jest
      .spyOn(registrationRequestServiceMock, 'searchWithFiltersAsync')
      .mockResolvedValue(result);

    // Act
    const response = await handler.execute(query);

    // Assert
    expect(response).toEqual(expectedResponse);
  });
});
