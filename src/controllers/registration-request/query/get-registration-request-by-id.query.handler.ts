import { QueryHandler } from '@nestjs/cqrs';
import { GetRegistrationRequestByIdQuery } from './get-registration-request-by-id.query';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { NotFoundException } from '@nestjs/common';
import { RegistrationRequestDetailsDto } from '@mp/common/dtos';

@QueryHandler(GetRegistrationRequestByIdQuery)
export class GetRegistrationRequestByIdQueryHandler {
  constructor(
    private readonly registrationRequestService: RegistrationRequestDomainService,
  ) {}

  async execute(query: GetRegistrationRequestByIdQuery) {
    const foundedRegistrationRequest =
      await this.registrationRequestService.findRegistrationRequestWithDetailsByIdAsync(
        query.id,
      );

    if (!foundedRegistrationRequest) {
      throw new NotFoundException(
        `Registration request with ID ${query.id} not found`,
      );
    }

    const registrationRequest: RegistrationRequestDetailsDto = {
      id: foundedRegistrationRequest.id,
      requestDate: foundedRegistrationRequest.requestDate,
      status: foundedRegistrationRequest.status.code,
      note: foundedRegistrationRequest.note,
      user: {
        fullNameOrBusinessName: `${foundedRegistrationRequest.user.firstName} ${foundedRegistrationRequest.user.lastName}`,
        documentNumber: foundedRegistrationRequest.user.documentNumber,
        documentType: foundedRegistrationRequest.user.documentType,
        email: foundedRegistrationRequest.user.email,
        phone: foundedRegistrationRequest.user.phone,
      },
    };

    return registrationRequest;
  }
}
