import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  SearchTownResponse,
  TownDto,
} from '@mp/common/dtos';

import { SearchTownQuery } from './search-town-query';
import { TownService } from '../../../domain/service/town/town.service';

@QueryHandler(SearchTownQuery)
export class SearchTownQueryHandler
  implements IQueryHandler<SearchTownQuery>
{
  constructor(
    private readonly townService: TownService,
  ) {}

  async execute(
    query: SearchTownQuery,
  ): Promise<SearchTownResponse> {
    const { data, total } =
      await this.townService.searchWithFiltersAsync(query);

    const mappedResponse = data.map(
      (town): TownDto => {
        return {
          id: town.id,
          name: town.name,
          zipCode: town.zipCode,
          provinceId: town.provinceId,
        };
      },
    );

    return new SearchTownResponse({
      total,
      results: mappedResponse,
    });
  }
}
