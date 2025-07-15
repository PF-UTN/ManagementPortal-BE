import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { SearchVehicleRequest, UpdateVehicleDto, VehicleCreationDto } from '@mp/common/dtos';

import { CreateVehicleCommand } from './command/create-vehicle.command';
import { DeleteVehicleRepairCommand } from './command/delete-vehicle-repair.command';
import { DeleteVehicleCommand } from './command/delete-vehicle.command';
import { UpdateVehicleCommand } from './command/update-vehicle.command';
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

  @Delete(':id')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.Vehicle.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a vehicle',
    description: 'Delete the vehicle with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the vehicle to delete',
  })
  deleteVehicleAsync(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteVehicleCommand(id));
  }

  @Put(':id')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Vehicle.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing vehicle',
    description: 'Update the vehicle with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the vehicle to update',
  })
  updateVehicleAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.commandBus.execute(
      new UpdateVehicleCommand(id, updateVehicleDto),
    );
  }

  @Delete('repair/:repairId')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.Repair.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a vehicle repair',
    description: 'Delete the vehicle repair with the provided ID.',
  })
  @ApiParam({
    name: 'repairId',
    description: 'ID of the vehicle repair to delete',
  })
  deleteVehicleRepairAsync(@Param('repairId', ParseIntPipe) repairId: number) {
    return this.commandBus.execute(new DeleteVehicleRepairCommand(repairId));
  }
}
