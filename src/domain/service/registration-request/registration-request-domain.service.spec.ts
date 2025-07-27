import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchRegistrationRequestFiltersDto } from '@mp/common/dtos';
import { RegistrationRequestRepository } from '@mp/repository';

import { RegistrationRequestDomainService } from './registration-request-domain.service';
import { DownloadRegistrationRequestQuery } from '../../../controllers/registration-request/query/download-registration-request-query';
import { SearchRegistrationRequestQuery } from '../../../controllers/registration-request/query/search-registration-request-query';

describe('RegistrationRequestDomainService', () => {
  let service: RegistrationRequestDomainService;
  let registrationRequestRepository: RegistrationRequestRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestDomainService,
        {
          provide: RegistrationRequestRepository,
          useValue: mockDeep(RegistrationRequestRepository),
        },
      ],
    }).compile();

    service = module.get<RegistrationRequestDomainService>(
      RegistrationRequestDomainService,
    );
    registrationRequestRepository = module.get<RegistrationRequestRepository>(
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
      expect(
        registrationRequestRepository.searchWithFiltersAsync,
      ).toHaveBeenCalledWith(
        query.searchText,
        query.filters,
        query.page,
        query.pageSize,
      );
    });
  });

  describe('downloadWithFiltersAsync', () => {
    it('should call downloadWithFiltersAsync on the repository with correct parameters', async () => {
      // arrange
      const query = {
        searchText: 'foo',
        filters: { status: ['Pending'] },
      } as DownloadRegistrationRequestQuery;
      jest
        .spyOn(registrationRequestRepository, 'downloadWithFiltersAsync')
        .mockResolvedValue([]);

      // act
      await service.downloadWithFiltersAsync(query);

      // assert
      expect(
        registrationRequestRepository.downloadWithFiltersAsync,
      ).toHaveBeenCalledWith(query.searchText, query.filters);
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
      expect(
        registrationRequestRepository.createRegistrationRequestAsync,
      ).toHaveBeenCalledWith(registrationRequestCreationDto);
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
        registrationRequestRepository.findRegistrationRequestWithStatusByIdAsync,
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
        registrationRequestRepository.updateRegistrationRequestStatusAsync,
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
