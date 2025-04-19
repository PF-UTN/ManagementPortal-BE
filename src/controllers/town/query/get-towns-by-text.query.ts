import { Query } from '@nestjs/cqrs';

export class GetTownsByTextQuery extends Query<void> {
    constructor(public readonly searchText: string) {
        super();
    }
  }