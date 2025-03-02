import { Controller, Post, Body } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SearchRegistrationRequestRequest } from '@mp/common/dtos';
import { SearchRegistrationRequestQuery } from './command/search-registration-request-query';
import { ApiOperation } from '@nestjs/swagger';

@Controller('registration-request')
export class RegistrationRequestController {
  constructor(private readonly queryBus: QueryBus) {}

  @Post('search')
  @ApiOperation({ summary: 'Search registration requests for listing', description: 'Search for registration requests based on the provided filters and search text.' })
  searchAsync(
    @Body() searchRegistrationRequestRequest: SearchRegistrationRequestRequest,
  ) {
    return this.queryBus.execute(
      new SearchRegistrationRequestQuery(searchRegistrationRequestRequest),
    );
  }
}
