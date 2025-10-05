import { Query } from '@nestjs/cqrs';

import { ClientAddressDto } from '@mp/common/dtos';

export class GetClientAddressByUserIdQuery extends Query<ClientAddressDto> {
  constructor(public readonly authorizationHeader: string) {
    super();
  }
}
