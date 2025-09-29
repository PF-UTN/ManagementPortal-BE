import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { ShipmentCreationDto } from '@mp/common/dtos';

import { CreateShipmentCommand } from './command/create-shipment.command';
import { SendShipmentCommand } from './command/send-shipment.command';

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

  @Patch('/:id/send')
  @RequiredPermissions(PermissionCodes.Shipment.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Send a shipment',
    description: 'Send an existant shipment.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the shipment to send',
  })
  async sendShipmentAsync(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new SendShipmentCommand(id));
  }
}
