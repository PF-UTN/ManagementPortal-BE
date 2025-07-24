import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { Public } from '@mp/common/decorators';
import { SearchTownRequest } from '@mp/common/dtos';

import { GetTownsByTextQuery } from './query/get-towns-by-text.query';
import { SearchTownQuery } from './query/search-town-query';

@Controller('town')
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

  @Public()
  @HttpCode(200)
  @Post('search')
  @ApiOperation({
    summary: 'Search towns with filters',
    description:
      'Search for towns based on the provided search text.',
  })
  async searchAsync(
    @Body() searchTownRequest: SearchTownRequest,
  ) {
    return this.queryBus.execute(
      new SearchTownQuery(searchTownRequest),
    );
  }
}