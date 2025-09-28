import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { ShipmentCreationDto } from '@mp/common/dtos';

import { CreateShipmentCommand } from './command/create-shipment.command';

@Controller('shipment')
export class ShipmentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/')
  @RequiredPermissions(PermissionCodes.Shipment.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a shipment',
    description: 'Create a new shipment.',
  })
  @ApiBody({ type: ShipmentCreationDto })
  async createShipmentAsync(@Body() shipmentCreationDto: ShipmentCreationDto) {
    return this.commandBus.execute(
      new CreateShipmentCommand(shipmentCreationDto),
    );
  }
}
