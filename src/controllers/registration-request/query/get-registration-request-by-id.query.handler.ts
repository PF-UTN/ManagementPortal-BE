import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { RegistrationRequestDetailsDto } from '@mp/common/dtos';

import { GetRegistrationRequestByIdQuery } from './get-registration-request-by-id.query';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';

@QueryHandler(GetRegistrationRequestByIdQuery)
export class GetRegistrationRequestByIdQueryHandler {
  constructor(
    private readonly registrationRequestService: RegistrationRequestDomainService,
  ) {}

  async execute(query: GetRegistrationRequestByIdQuery) {
    const foundRegistrationRequest =
      await this.registrationRequestService.findRegistrationRequestWithDetailsByIdAsync(
        query.id,
      );

    if (!foundRegistrationRequest) {
      throw new NotFoundException(
        `Solicitud de registro con ID ${query.id} no encontrada.`,
      );
    }

    const registrationRequest: RegistrationRequestDetailsDto = {
      id: foundRegistrationRequest.id,
      requestDate: foundRegistrationRequest.requestDate,
      status: foundRegistrationRequest.status.code,
      note: foundRegistrationRequest.note ?? undefined,
      user: {
        fullNameOrBusinessName: `${foundRegistrationRequest.user.firstName} ${foundRegistrationRequest.user.lastName}`,
        documentNumber: foundRegistrationRequest.user.documentNumber,
        documentType: foundRegistrationRequest.user.documentType,
        email: foundRegistrationRequest.user.email,
        phone: foundRegistrationRequest.user.phone,
      },
    };

    return registrationRequest;
  }
}
