import { Test, TestingModule } from '@nestjs/testing';
import { SearchRegistrationRequestFiltersDto } from '@mp/common/dtos';
import { PrismaService } from '../prisma.service';
import { RegistrationRequestRepository } from './registration-request.repository';

describe('RegistrationRequestRepository', () => {
  let repository: RegistrationRequestRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestRepository,
        {
          provide: PrismaService,
          useValue: {
            registrationRequest: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<RegistrationRequestRepository>(
      RegistrationRequestRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('searchWithFiltersAsync', () => {
    it('should construct the correct query with status filter', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchRegistrationRequestFiltersDto = {
        status: ['Pending'],
      };
      const page = 1;
      const pageSize = 10;

      // Act
      await repository.searchWithFiltersAsync(
        searchText,
        filters,
        page,
        pageSize,
      );

      // Assert
      expect(prismaService.registrationRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                status: {
                  is: {
                    code: { in: filters.status },
                  },
                },
              },
              expect.any(Object),
            ],
          },
        }),
      );
    });

    it('should construct the correct query with search text filter', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchRegistrationRequestFiltersDto = {};
      const page = 1;
      const pageSize = 10;

      // Act
      await repository.searchWithFiltersAsync(
        searchText,
        filters,
        page,
        pageSize,
      );

      // Assert
      expect(prismaService.registrationRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              expect.any(Object),
              {
                OR: [
                  {
                    user: {
                      firstName: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    user: {
                      lastName: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    user: {
                      email: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  },
                ],
              },
            ],
          },
        }),
      );
    });

    it('should construct the correct query with skip and take', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchRegistrationRequestFiltersDto = {};
      const page = 2;
      const pageSize = 10;

      // Act
      await repository.searchWithFiltersAsync(
        searchText,
        filters,
        page,
        pageSize,
      );

      // Assert
      expect(prismaService.registrationRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      );
    });
  });
describe('createRegistrationRequestAsync', () => {
  it('should create a new registration request', async () => {
    // Arrange
    const createData = {
      user: {
        connect: { id: 1 },
      },
      status: {
        connect: { id: 1 },
      },
      requestDate: new Date(),
      note: 'test',
    };
    const createdRequest = {
      id: 1,
      ...createData,
    };
    prismaService.registrationRequest.create = jest
      .fn()
      .mockResolvedValue(createdRequest);

    // Act
    const result = await repository.createRegistrationRequestAsync(createData);

    // Assert
    expect(prismaService.registrationRequest.create).toHaveBeenCalledWith({
      data: createData,
    });
    expect(result).toEqual(createdRequest);
  });
});
});
