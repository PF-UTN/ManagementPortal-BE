import { QueryHandler } from '@nestjs/cqrs';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { ClientService } from './../../../domain/service/client/client.service';
import { GetClientAddressByUserIdQuery } from './get-client-address-by-user-id.query';

@QueryHandler(GetClientAddressByUserIdQuery)
export class GetClientAddressByUserIdQueryHandler {
  constructor(
    private readonly clientService: ClientService,
    private readonly authenticationService: AuthenticationService,
  ) {}
  async execute(query: GetClientAddressByUserIdQuery) {
    const token = query.authorizationHeader.split(' ')[1];
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;

    return await this.clientService.findClientAddressByUserIdAsync(userId);
  }
}
