import { Query } from '@nestjs/cqrs';

import { GetShipmentByIdDto } from '@mp/common/dtos';

export class GetShipmentByIdQuery extends Query<GetShipmentByIdDto> {
  constructor(public readonly id: number) {
    super();
  }
}
