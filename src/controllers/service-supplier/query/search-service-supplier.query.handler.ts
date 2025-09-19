import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  SearchServiceSupplierResponse,
  ServiceSupplierSearchResponseDto,
} from '@mp/common/dtos';

import { SearchServiceSupplierQuery } from './search-service-supplier.query';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

@QueryHandler(SearchServiceSupplierQuery)
export class SearchServiceSupplierQueryHandler
  implements IQueryHandler<SearchServiceSupplierQuery>
{
  constructor(
    private readonly serviceSupplierService: ServiceSupplierService,
  ) {}

  async execute(
    query: SearchServiceSupplierQuery,
  ): Promise<SearchServiceSupplierResponse> {
    const { data, total } =
      await this.serviceSupplierService.searchByTextAsync(query);

    const mappedResponse = data.map(
      (serviceSupplier): ServiceSupplierSearchResponseDto => {
        return {
          id: serviceSupplier.id,
          businessName: serviceSupplier.businessName,
        };
      },
    );

    return new SearchServiceSupplierResponse({
      total,
      results: mappedResponse,
    });
  }
}
