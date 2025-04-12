import { Controller, Get, HttpCode } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation } from '@nestjs/swagger';
import { GetAllCountriesQuery } from './query/get-all-countries.query';
import { Public } from '@mp/common/decorators';

@Controller('countries')
export class CountryController {
  constructor(private readonly queryBus: QueryBus) { }

  @Public()
  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all countries',
    description:
      'Retrieve a complete list of all countries,  including their names and corresponding codes.',
  })
  async getAllCountriesAsync() {
    return this.queryBus.execute(new GetAllCountriesQuery());
  }
}
