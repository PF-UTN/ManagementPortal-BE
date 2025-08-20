import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  SearchMaintenanceResponse,
  MaintenanceSummaryDto,
} from '@mp/common/dtos';

import { SearchMaintenanceQuery } from './search-maintenance-query';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

@QueryHandler(SearchMaintenanceQuery)
export class SearchMaintenanceQueryHandler
  implements IQueryHandler<SearchMaintenanceQuery>
{
  constructor(private readonly maintenanceService: MaintenanceService) {}

  async execute(
    query: SearchMaintenanceQuery,
  ): Promise<SearchMaintenanceResponse> {
    const { data, total } =
      await this.maintenanceService.searchByTextAndVehicleIdAsync(query);

    const mappedResponse = data.map((maintenance): MaintenanceSummaryDto => {
      return {
        id: maintenance.id,
        date: maintenance.date,
        description:
          maintenance.maintenancePlanItem.maintenanceItem.description,
        kmPerformed: maintenance.kmPerformed,
      };
    });

    return new SearchMaintenanceResponse({
      total,
      results: mappedResponse,
    });
  }
}
