import { QueryHandler } from '@nestjs/cqrs';

import { TownService } from '../../../domain/service/town/town.service';
import { GetTownsByTextQuery } from '../query/get-towns-by-text.query';

@QueryHandler(GetTownsByTextQuery)
export class GetTownByTextQueryHandler {
  constructor(private readonly townService: TownService) {}

  async execute(query: GetTownsByTextQuery) {
    const foundTowns = await this.townService.searchTownsByTextAsync(query.searchText);

    return foundTowns.map((town) => ({
        id: town.id,
        name: town.name,
        zipCode: town.zipCode,
        provinceId: town.provinceId,
      }));
  
  }
}