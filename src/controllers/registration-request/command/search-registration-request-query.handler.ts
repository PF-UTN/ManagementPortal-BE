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

  statusTranslations: Record<string, string> = {
    Pending: 'Pendiente',
    Approved: 'Aprobada',
    Rejected: 'Rechazada',
  };

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
          status: this.statusTranslations[registrationRequest.status.code] || registrationRequest.status.code,
          user: {
            fullNameOrBusinessName: `${registrationRequest.user.firstName} ${registrationRequest.user.lastName}`,
            documentNumber: registrationRequest.user.documentNumber,
            documentType: registrationRequest.user.documentType,
            email: registrationRequest.user.email,
            phone: registrationRequest.user.phone,
            taxCategory: registrationRequest.user.client!.taxCategory.name,
            address: {
              streetAddress: registrationRequest.user.client!.address.street + ' ' + registrationRequest.user.client!.address.streetNumber,
              town: registrationRequest.user.client!.address.town.name,
              zipCode: registrationRequest.user.client!.address.town.zipCode,
            }
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
