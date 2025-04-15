import { Controller, Get, HttpCode, Param, ParseIntPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { GetProvincesByIdQuery } from './query/get-provinces-by-country-id.query';
import { Public } from '@mp/common/decorators';


@Controller('provinces')
export class ProvinceController {
    constructor(private readonly queryBus: QueryBus) { }

    @Public()
    @Get(':id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Get provinces by country ID',
        description: 'Retrieve a list of all provinces that belong to the specified country.',
    })
    @ApiParam({
        name: 'countryId',
        description: 'The ID of the country to retrieve provinces from',
    })

    getProvincesByIdAsync(@Param('id', ParseIntPipe) id: number) {
        return this.queryBus.execute(new GetProvincesByIdQuery(id));
    }

}
