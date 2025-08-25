import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  SearchMaintenancePlanItemResponse,
  MaintenancePlanItemDetailDto,
} from '@mp/common/dtos';

import { SearchMaintenancePlanItemQuery } from './search-maintenance-plan-item-query';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

@QueryHandler(SearchMaintenancePlanItemQuery)
export class SearchMaintenancePlanItemQueryHandler
  implements IQueryHandler<SearchMaintenancePlanItemQuery>
{
  constructor(
    private readonly maintenancePlanItemService: MaintenancePlanItemService,
  ) {}

  async execute(
    query: SearchMaintenancePlanItemQuery,
  ): Promise<SearchMaintenancePlanItemResponse> {
    const { data, total } =
      await this.maintenancePlanItemService.searchByTextAndVehicleIdAsync(
        query,
      );

    const mappedResponse = data.map(
      (maintenancePlanItem): MaintenancePlanItemDetailDto => {
        return {
          description: maintenancePlanItem.maintenanceItem.description,
          kmInterval: maintenancePlanItem.kmInterval,
          timeInterval: maintenancePlanItem.timeInterval,
        };
      },
    );

    return new SearchMaintenancePlanItemResponse({
      total,
      results: mappedResponse,
    });
  }
}
