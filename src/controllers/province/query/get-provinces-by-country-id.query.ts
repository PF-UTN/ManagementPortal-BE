import { Query } from '@nestjs/cqrs';
import { Province } from '@prisma/client';

export class GetProvincesByIdQuery extends Query<Province[]> {
  constructor(public readonly id: number) {
    super();
  }
}