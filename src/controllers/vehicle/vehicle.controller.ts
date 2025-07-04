import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { SearchVehicleRequest, VehicleCreationDto } from '@mp/common/dtos';

import { CreateVehicleCommand } from './command/create-vehicle.command';
import { SearchVehicleQuery } from './query/search-vehicle-query';

@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post()
  @HttpCode(201)
  @RequiredPermissions(PermissionCodes.Vehicle.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a vehicle',
    description: 'Creates a new vehicle with the provided details.',
  })
  async createVehicleAsync(@Body() vehicleCreationDto: VehicleCreationDto) {
    return this.commandBus.execute(
      new CreateVehicleCommand(vehicleCreationDto),
    );
  }

  @Post('search')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Vehicle.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search vehicles with search text',
    description: 'Search for vehicles based on the provided search text.',
  })
  async searchAsync(@Body() searchVehicleRequest: SearchVehicleRequest) {
    return this.queryBus.execute(new SearchVehicleQuery(searchVehicleRequest));
  }
}
