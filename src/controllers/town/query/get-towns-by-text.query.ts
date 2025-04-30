import { Query } from '@nestjs/cqrs';

import { TownDto } from '@mp/common/dtos';

export class GetTownsByTextQuery extends Query<TownDto[]> {
    constructor(public readonly searchText: string) {
        super();
    }
  }