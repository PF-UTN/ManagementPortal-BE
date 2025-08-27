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
import {
  MaintenancePlanItemCreationDto,
  RepairCreationDto,
  SearchRepairRequest,
  SearchMaintenanceRequest,
  SearchVehicleRequest,
  UpdateVehicleDto,
  VehicleCreationDto,
  SearchMaintenancePlanItemRequest,
  UpdateMaintenancePlanItemDto,
} from '@mp/common/dtos';

import { CreateVehicleMaintenancePlanItemCommand } from './command/create-vehicle-maintenance-plan-item.command';
import { CreateVehicleRepairCommand } from './command/create-vehicle-repair.command';
import { CreateVehicleCommand } from './command/create-vehicle.command';
import { DeleteVehicleRepairCommand } from './command/delete-vehicle-repair.command';
import { DeleteVehicleCommand } from './command/delete-vehicle.command';
import { UpdateVehicleMaintenancePlanItemCommand } from './command/update-vehicle-maintenance-plan-item.command';
import { UpdateVehicleCommand } from './command/update-vehicle.command';
import { SearchMaintenancePlanItemQuery } from './query/search-maintenance-plan-item-query';
import { SearchMaintenanceQuery } from './query/search-maintenance-query';
import { SearchRepairQuery } from './query/search-repair-query';
import { SearchVehicleQuery } from './query/search-vehicle-query';

@Controller('vehicle')
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

  @Post(':vehicleId/repair')
  @HttpCode(201)
  @RequiredPermissions(PermissionCodes.Repair.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a vehicle repair',
    description: 'Creates a new repair for the vehicle with the provided ID.',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'ID of the vehicle to create a repair for',
  })
  async createVehicleRepairAsync(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() repairCreationDto: RepairCreationDto,
  ) {
    return this.commandBus.execute(
      new CreateVehicleRepairCommand(vehicleId, repairCreationDto),
    );
  }

  @Post('maintenance-plan-item')
  @HttpCode(201)
  @RequiredPermissions(PermissionCodes.MaintenancePlanItem.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a vehicle maintenance plan item',
    description:
      'Creates a new maintenance plan item for the vehicle with the provided ID.',
  })
  async createVehicleMaintenancePlanItemAsync(
    @Body() maintenancePlanItemCreationDto: MaintenancePlanItemCreationDto,
  ) {
    return this.commandBus.execute(
      new CreateVehicleMaintenancePlanItemCommand(
        maintenancePlanItemCreationDto,
      ),
    );
  }

  @Post(':id/repair/search')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Repair.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search vehicle repairs',
    description: 'Search for repairs of the vehicle with the provided ID.',
  })
  async searchVehicleRepairsAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() searchRepairRequest: SearchRepairRequest,
  ) {
    return this.queryBus.execute(
      new SearchRepairQuery(id, searchRepairRequest),
    );
  }

  @Post(':id/maintenance/search')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Maintenance.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search vehicle maintenance',
    description: 'Search for maintenance of the vehicle with the provided ID.',
  })
  async searchVehicleMaintenanceAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() searchMaintenanceRequest: SearchMaintenanceRequest,
  ) {
    return this.queryBus.execute(
      new SearchMaintenanceQuery(id, searchMaintenanceRequest),
    );
  }

  @Post(':id/maintenance-plan-item/search')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Maintenance.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search vehicle maintenance plan items',
    description:
      'Search for maintenance plan items of the vehicle with the provided ID.',
  })
  async searchVehicleMaintenancePlanItemsAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() searchMaintenancePlanItemRequest: SearchMaintenancePlanItemRequest,
  ) {
    return this.queryBus.execute(
      new SearchMaintenancePlanItemQuery(id, searchMaintenancePlanItemRequest),
    );
  }

  @Put('/maintenance-plan-item/:id')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.MaintenancePlanItem.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a vehicle maintenance plan item',
    description:
      'Updates the vehicle maintenance plan item with the provided ID.',
  })
  async updateVehicleMaintenancePlanItemAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaintenancePlanItemDto: UpdateMaintenancePlanItemDto,
  ) {
    return this.commandBus.execute(
      new UpdateVehicleMaintenancePlanItemCommand(
        id,
        updateMaintenancePlanItemDto,
      ),
    );
  }
}
