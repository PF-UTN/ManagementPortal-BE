import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { statusTranslations } from '@mp/common/constants';
import { DownloadRegistrationRequestDto } from '@mp/common/dtos';

import { DownloadRegistrationRequestQuery } from './download-registration-request-query';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';

@QueryHandler(DownloadRegistrationRequestQuery)
export class DownloadRegistrationRequestQueryHandler
  implements IQueryHandler<DownloadRegistrationRequestQuery>
{
  constructor(
    private readonly registrationRequestDomainService: RegistrationRequestDomainService,
  ) {}

  async execute(
    query: DownloadRegistrationRequestQuery,
  ): Promise<DownloadRegistrationRequestDto[]> {
    const data =
      await this.registrationRequestDomainService.downloadWithFiltersAsync(
        query,
      );

    return data.map(
      (registrationRequest): DownloadRegistrationRequestDto => ({
        ID: registrationRequest.id,
        Estado:
          statusTranslations[registrationRequest.status.code] ||
          registrationRequest.status.code,
        FechaSolicitud: registrationRequest.requestDate,
        Nombre: `${registrationRequest.user.firstName} ${registrationRequest.user.lastName}`,
        Email: registrationRequest.user.email,
        TipoDocumento: registrationRequest.user.documentType,
        NumeroDocumento: registrationRequest.user.documentNumber,
        Telefono: registrationRequest.user.phone,
        CategoriaImpositiva: registrationRequest.user.client!.taxCategory.name,
        Calle: `${registrationRequest.user.client!.address.street} ${registrationRequest.user.client!.address.streetNumber}`,
        Ciudad: registrationRequest.user.client!.address.town.name,
        CodigoPostal: registrationRequest.user.client!.address.town.zipCode,
      }),
    );
  }
}
