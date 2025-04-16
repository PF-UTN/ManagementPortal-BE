import { Test, TestingModule } from '@nestjs/testing';

import { SearchRegistrationRequestFiltersDto } from '@mp/common/dtos';
import { PrismaServiceMock } from '@mp/common/testing';

import { PrismaService } from '../prisma.service';
import { RegistrationRequestRepository } from './registration-request.repository';

describe('RegistrationRequestRepository', () => {
  let repository: RegistrationRequestRepository;
  let prismaServiceMock: PrismaServiceMock;

  beforeEach(async () => {
    prismaServiceMock = new PrismaServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<RegistrationRequestRepository>(
      RegistrationRequestRepository,
    );
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
      expect(
        prismaServiceMock.registrationRequest.findMany,
      ).toHaveBeenCalledWith(
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
      expect(
        prismaServiceMock.registrationRequest.findMany,
      ).toHaveBeenCalledWith(
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
      expect(
        prismaServiceMock.registrationRequest.findMany,
      ).toHaveBeenCalledWith(
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
      prismaServiceMock.registrationRequest.create = jest
        .fn()
        .mockResolvedValue(createdRequest);

      // Act
      const result =
        await repository.createRegistrationRequestAsync(createData);

      // Assert
      expect(prismaServiceMock.registrationRequest.create).toHaveBeenCalledWith(
        {
          data: createData,
        },
      );
      expect(result).toEqual(createdRequest);
    });
  });

  describe('findRegistrationRequestWithStatusByIdAsync', () => {
    it('should return the registration request with status by id', async () => {
      // Arrange
      const registrationRequestId = 1;
      const registrationRequest = {
        id: registrationRequestId,
        status: { id: 1, code: 'Pending' },
      };
      prismaServiceMock.registrationRequest.findUnique = jest
        .fn()
        .mockResolvedValue(registrationRequest);

      // Act
      const result =
        await repository.findRegistrationRequestWithStatusByIdAsync(
          registrationRequestId,
        );

      // Assert
      expect(
        prismaServiceMock.registrationRequest.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: registrationRequestId },
        include: { status: true },
      });
      expect(result).toEqual(registrationRequest);
    });
  });

  describe('findRegistrationRequestWithDetailsByIdAsync', () => {
    it('should return the registration request with details by id', async () => {
      // Arrange
      const registrationRequestId = 1;
      const registrationRequest = {
        id: registrationRequestId,
        status: { id: 1, code: 'Pending' },
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      };
      prismaServiceMock.registrationRequest.findUnique = jest
        .fn()
        .mockResolvedValue(registrationRequest);

      // Act
      const result =
        await repository.findRegistrationRequestWithDetailsByIdAsync(
          registrationRequestId,
        );

      // Assert
      expect(
        prismaServiceMock.registrationRequest.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: registrationRequestId },
        include: { status: true, user: true },
      });
      expect(result).toEqual(registrationRequest);
    });
  });

  describe('updateRegistrationRequestStatusAsync', () => {
    it('should update the registration request status', async () => {
      // Arrange
      const registrationRequestId = 1;
      const updateData = { status: { connect: { id: 2 } } };
      const updatedRequest = {
        id: registrationRequestId,
        status: { id: 2, code: 'Approved' },
      };
      prismaServiceMock.registrationRequest.update = jest
        .fn()
        .mockResolvedValue(updatedRequest);

      // Act
      const result = await repository.updateRegistrationRequestStatusAsync(
        registrationRequestId,
        updateData,
      );

      // Assert
      expect(prismaServiceMock.registrationRequest.update).toHaveBeenCalledWith(
        {
          where: { id: registrationRequestId },
          data: updateData,
        },
      );
      expect(result).toEqual(updatedRequest);
    });
  });
});
