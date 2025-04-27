import { Query } from '@nestjs/cqrs';
import { Town } from '@prisma/client'

export class GetTownsByTextQuery extends Query<Town[]> {
    constructor(public readonly searchText: string) {
        super();
    }
  }