import { Injectable } from '@nestjs/common';

import {
  RegistrationRequestCreationDto,
  UpdateRegistrationRequestStatusDto,
} from '@mp/common/dtos';
import { RegistrationRequestRepository } from '@mp/repository';

import { DownloadRegistrationRequestQuery } from '../../../controllers/registration-request/query/download-registration-request-query';
import { SearchRegistrationRequestQuery } from '../../../controllers/registration-request/query/search-registration-request-query';

@Injectable()
export class RegistrationRequestDomainService {
  constructor(
    private readonly registrationRequestRepository: RegistrationRequestRepository,
  ) {}

  async searchWithFiltersAsync(query: SearchRegistrationRequestQuery) {
    return await this.registrationRequestRepository.searchWithFiltersAsync(
      query.searchText,
      query.filters,
      query.page,
      query.pageSize,
    );
  }

  async downloadWithFiltersAsync(query: DownloadRegistrationRequestQuery) {
    return await this.registrationRequestRepository.downloadWithFiltersAsync(
      query.searchText,
      query.filters,
    );
  }

  async createRegistrationRequestAsync(
    registrationRequestCreationDto: RegistrationRequestCreationDto,
  ) {
    return await this.registrationRequestRepository.createRegistrationRequestAsync(
      registrationRequestCreationDto,
    );
  }

  async findRegistrationRequestByIdAsync(registrationRequestId: number) {
    return this.registrationRequestRepository.findRegistrationRequestWithStatusByIdAsync(
      registrationRequestId,
    );
  }

  async findRegistrationRequestWithDetailsByIdAsync(
    registrationRequestId: number,
  ) {
    return this.registrationRequestRepository.findRegistrationRequestWithDetailsByIdAsync(
      registrationRequestId,
    );
  }

  async updateRegistrationRequestStatusAsync(
    updateRegistrationRequestStatusDto: UpdateRegistrationRequestStatusDto,
  ) {
    return await this.registrationRequestRepository.updateRegistrationRequestStatusAsync(
      updateRegistrationRequestStatusDto.registrationRequestId,
      {
        status: updateRegistrationRequestStatusDto.status,
        note: updateRegistrationRequestStatusDto.note,
      },
    );
  }
}
