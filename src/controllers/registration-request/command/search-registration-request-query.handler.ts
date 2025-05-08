import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  RegistrationRequestDto,
  SearchRegistrationRequestResponse,
} from '@mp/common/dtos';

import { SearchRegistrationRequestQuery } from './search-registration-request-query';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';

@QueryHandler(SearchRegistrationRequestQuery)
export class SearchRegistrationRequestQueryHandler
  implements IQueryHandler<SearchRegistrationRequestQuery>
{
  constructor(
    private readonly registrationRequestDomainService: RegistrationRequestDomainService,
  ) {}

  async execute(
    query: SearchRegistrationRequestQuery,
  ): Promise<SearchRegistrationRequestResponse> {
    const { data, total } =
      await this.registrationRequestDomainService.searchWithFiltersAsync(query);

    const mappedResponse = data.map(
      (registrationRequest): RegistrationRequestDto => {
        return {
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
        };
      },
    );

    return new SearchRegistrationRequestResponse({
      total,
      results: mappedResponse,
    });
  }
}
