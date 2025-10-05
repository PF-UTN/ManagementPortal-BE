import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SearchRepairResponse, RepairSummaryDto } from '@mp/common/dtos';

import { SearchRepairQuery } from './search-repair-query';
import { RepairService } from '../../../domain/service/repair/repair.service';

@QueryHandler(SearchRepairQuery)
export class SearchRepairQueryHandler
  implements IQueryHandler<SearchRepairQuery>
{
  constructor(private readonly repairService: RepairService) {}

  async execute(query: SearchRepairQuery): Promise<SearchRepairResponse> {
    const { data, total } =
      await this.repairService.searchByTextAndVehicleIdAsync(query);

    const mappedResponse = data.map((repair): RepairSummaryDto => {
      return {
        id: repair.id,
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        serviceSupplierId: repair.serviceSupplierId,
      };
    });

    return new SearchRepairResponse({
      total,
      results: mappedResponse,
    });
  }
}
