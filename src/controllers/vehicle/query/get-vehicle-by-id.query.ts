import { Query } from '@nestjs/cqrs';

import { VehicleDto } from '@mp/common/dtos';

export class GetVehicleByIdQuery extends Query<VehicleDto> {
  constructor(public readonly id: number) {
    super();
  }
}
