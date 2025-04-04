import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestRepository } from '@mp/repository';
import { SearchRegistrationRequestFiltersDto } from '@mp/common/dtos';
import { RegistrationRequestDomainService } from './registration-request-domain.service';
import { SearchRegistrationRequestQuery } from '../../../controllers/registration-request/command/search-registration-request-query';

describe('RegistrationRequestDomainService', () => {
  let service: RegistrationRequestDomainService;
  let repository: RegistrationRequestRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestDomainService,
        {
          provide: RegistrationRequestRepository,
          useValue: {
            searchWithFiltersAsync: jest.fn(),
            createRegistrationRequestAsync: jest.fn(),
            findRegistrationRequestWithStatusByIdAsync: jest.fn(),
            updateRegistrationRequestStatusAsync: jest.fn(),
            findRegistrationRequestWithDetailsByIdAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationRequestDomainService>(
      RegistrationRequestDomainService,
    );
    repository = module.get<RegistrationRequestRepository>(
      RegistrationRequestRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchRegistrationRequestFiltersDto = {
        status: ['Pending'],
      };
      const page = 1;
      const pageSize = 10;
      const query = new SearchRegistrationRequestQuery({
        searchText,
        filters,
        page,
        pageSize,
      });

      // Act
      await service.searchWithFiltersAsync(query);

      // Assert
      expect(repository.searchWithFiltersAsync).toHaveBeenCalledWith(
        query.searchText,
        query.filters,
        query.page,
        query.pageSize,
      );
    });
  });

  describe('createRegistrationRequestAsync', () => {
    it('should call createRegistrationRequestAsync on the repository with correct parameters', async () => {
      // Arrange
      const registrationRequestCreationDto = {
        note: 'test',
        status: { connect: { id: 1 } },
        user: { connect: { id: 1 } },
      };

      // Act
      await service.createRegistrationRequestAsync(
        registrationRequestCreationDto,
      );

      // Assert
      expect(repository.createRegistrationRequestAsync).toHaveBeenCalledWith(
        registrationRequestCreationDto,
      );
    });
  });

  describe('findRegistrationRequestByIdAsync', () => {
    it('should call findRegistrationRequestWithStatusByIdAsync on the repository with correct parameters', async () => {
      // Arrange
      const registrationRequestId = 1;

      // Act
      await service.findRegistrationRequestByIdAsync(registrationRequestId);

      // Assert
      expect(
        repository.findRegistrationRequestWithStatusByIdAsync,
      ).toHaveBeenCalledWith(registrationRequestId);
    });
  });

  describe('findRegistrationRequestWithDetailsByIdAsync', () => {
    it('should call findRegistrationRequestWithDetailsByIdAsync on the repository with correct parameters', async () => {
      // Arrange
      const registrationRequestId = 1;

      // Act
      await service.findRegistrationRequestWithDetailsByIdAsync(
        registrationRequestId,
      );

      // Assert
      expect(
        repository.findRegistrationRequestWithDetailsByIdAsync,
      ).toHaveBeenCalledWith(registrationRequestId);
    });
  });

  describe('updateRegistrationRequestStatusAsync', () => {
    it('should call updateRegistrationRequestStatusAsync on the repository with correct parameters', async () => {
      // Arrange
      const updateRegistrationRequestStatusDto = {
        registrationRequestId: 1,
        status: { connect: { id: 1 } },
        note: 'Approved by admin',
      };

      // Act
      await service.updateRegistrationRequestStatusAsync(
        updateRegistrationRequestStatusDto,
      );

      // Assert
      expect(
        repository.updateRegistrationRequestStatusAsync,
      ).toHaveBeenCalledWith(
        updateRegistrationRequestStatusDto.registrationRequestId,
        {
          status: updateRegistrationRequestStatusDto.status,
          note: updateRegistrationRequestStatusDto.note,
        },
      );
    });
  });
});
