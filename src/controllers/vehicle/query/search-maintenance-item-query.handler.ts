import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  SearchMaintenanceItemResponse,
  MaintenanceItemDto,
} from '@mp/common/dtos';

import { SearchMaintenanceItemQuery } from './search-maintenance-item-query';
import { MaintenanceItemService } from '../../../domain/service/maintenance-item/maintenance-item.service';

@QueryHandler(SearchMaintenanceItemQuery)
export class SearchMaintenanceItemQueryHandler
  implements IQueryHandler<SearchMaintenanceItemQuery>
{
  constructor(
    private readonly maintenanceItemService: MaintenanceItemService,
  ) {}

  async execute(
    query: SearchMaintenanceItemQuery,
  ): Promise<SearchMaintenanceItemResponse> {
    const { data, total } =
      await this.maintenanceItemService.searchByTextAsync(query);

    const mappedResponse = data.map((maintenanceItem): MaintenanceItemDto => {
      return {
        id: maintenanceItem.id,
        description: maintenanceItem.description,
      };
    });

    return new SearchMaintenanceItemResponse({
      total,
      results: mappedResponse,
    });
  }
}
