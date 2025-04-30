import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { Public } from '@mp/common/decorators';

import { GetTownsByTextQuery } from './query/get-towns-by-text.query';

@Controller('towns')
export class TownController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Search towns by name or zip code',
    description: 'Retrieve towns that match the search text provided.',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  searchTownsAsync(@Query('search') searchText?: string) {
    return this.queryBus.execute(new GetTownsByTextQuery(searchText || ''));
}
}