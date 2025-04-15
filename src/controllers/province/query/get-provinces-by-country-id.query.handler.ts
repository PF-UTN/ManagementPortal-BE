import { ProvinceDto } from '@mp/common/dtos';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProvincesByIdQuery } from './get-provinces-by-country-id.query'
import { ProvinceService } from '../../../domain/service/province/province.service';


@QueryHandler(GetProvincesByIdQuery)
export class GetProvincesByIdQueryHandler
    implements IQueryHandler<GetProvincesByIdQuery> {
    constructor(private readonly provinceService: ProvinceService) { }

    async execute(query: GetProvincesByIdQuery): Promise<ProvinceDto[]> {
        const foundProvinces =
            await this.provinceService.getProvincesByIdAsync(
                query.id,
            );

        const provinceList: ProvinceDto[] = foundProvinces.map((province) => ({
            id: province.id,
            name: province.name,
            countryId: province.countryId,
        }));

        return provinceList;
    }
}
