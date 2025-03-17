import { Injectable } from '@nestjs/common';
import { RegistrationRequestRepository } from '@mp/repository';
import { RegistrationRequestCreationDto } from '@mp/common/dtos';
import { SearchRegistrationRequestQuery } from '../../../controllers/registration-request/command/search-registration-request-query';

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

  async createRegistrationRequestAsync(registrationRequestCreationDto: RegistrationRequestCreationDto) {
    return await this.registrationRequestRepository.createRegistrationRequestAsync(
      registrationRequestCreationDto,
    );
  }
}
