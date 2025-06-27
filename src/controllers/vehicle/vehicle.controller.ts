import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { VehicleCreationDto } from '@mp/common/dtos';

import { CreateVehicleCommand } from './command/create-vehicle.command';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(201)
  @RequiredPermissions(PermissionCodes.Vehicle.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a vehicle',
    description: 'Creates a new vehicle with the provided details.',
  })
  async createVehicleAsync(
    @Body() vehicleCreationDto: VehicleCreationDto,
  ) {
    return this.commandBus.execute(
      new CreateVehicleCommand(vehicleCreationDto),
    );
  }
}
