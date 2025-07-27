import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { statusTranslations } from '@mp/common/constants';

import { DownloadRegistrationRequestQuery } from './download-registration-request-query';
import { DownloadRegistrationRequestQueryHandler } from './download-registration-request-query.handler';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';

describe('DownloadRegistrationRequestQueryHandler', () => {
  let handler: DownloadRegistrationRequestQueryHandler;
  let registrationRequestDomainService: RegistrationRequestDomainService;

  beforeEach(async () => {
    const registrationRequestDomainServiceMock = {
      downloadWithFiltersAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadRegistrationRequestQueryHandler,
        {
          provide: RegistrationRequestDomainService,
          useValue: registrationRequestDomainServiceMock,
        },
      ],
    }).compile();

    handler = module.get<DownloadRegistrationRequestQueryHandler>(
      DownloadRegistrationRequestQueryHandler,
    );
    registrationRequestDomainService =
      module.get<RegistrationRequestDomainService>(
        RegistrationRequestDomainService,
      );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should map the response correctly', async () => {
    // arrange
    const query = new DownloadRegistrationRequestQuery({
      searchText: 'test',
      filters: { status: ['Pendiente'] },
    });

    const requestDate = new Date(2024, 1, 1);

    const data = [
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
        requestDate,
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

    jest
      .spyOn(registrationRequestDomainService, 'downloadWithFiltersAsync')
      .mockResolvedValue(data);

    // act
    const result = await handler.execute(query);

    // assert
    expect(result).toEqual([
      {
        ID: 1,
        Estado: statusTranslations['Pendiente'] || 'Pendiente',
        FechaSolicitud: data[0].requestDate,
        Nombre: 'John Doe',
        Email: 'john.doe@example.com',
        TipoDocumento: 'DNI',
        NumeroDocumento: '12345678',
        Telefono: '123-456-7890',
        CategoriaImpositiva: 'Monotributo',
        Calle: 'Main St 56',
        Ciudad: 'Springfield',
        CodigoPostal: '12345',
      },
    ]);
  });

  it('should call downloadWithFiltersAsync on the domain service with the query', async () => {
    // arrange
    const query = new DownloadRegistrationRequestQuery({
      searchText: 'test',
      filters: { status: ['Pendiente'] },
    });
    jest
      .spyOn(registrationRequestDomainService, 'downloadWithFiltersAsync')
      .mockResolvedValue([]);

    // act
    await handler.execute(query);

    // assert
    expect(
      registrationRequestDomainService.downloadWithFiltersAsync,
    ).toHaveBeenCalledWith(query);
  });
});
